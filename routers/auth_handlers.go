package routers

import (
	"abgenius/envload"
	"abgenius/logging"
	"abgenius/models"
	"net/http"
	"time"

	"github.com/danilopolani/gocialite"
	"github.com/globalsign/mgo/bson"
	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
	gonanoid "github.com/matoous/go-nanoid"
)

var envConfig, _ = envload.LoadEnv()
var jwtAuthConfig = jwtauth.New("HS256", []byte(envConfig.JWTSecret), nil)
var gocial = gocialite.NewDispatcher()

//AuthRedirect will send users to the proper page to enter their credential based on their sign-in method
func (h APIHandler) AuthRedirect(w http.ResponseWriter, r *http.Request) {
	if origin := r.Header.Get("Origin"); origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
	authProvider := chi.URLParam(r, "provider")
	providerScopes := map[string][]string{
		"google": {},
	}
	authConfig := h.AuthProviderConfig[authProvider]
	authScopes := providerScopes[authProvider]
	authURL, err := gocial.New().
		Driver(authProvider).
		Scopes(authScopes).
		Redirect(
			authConfig["clientID"],
			authConfig["clientSecret"],
			authConfig["callbackURL"],
		)
	if err != nil {
		sendErrorCode(w, 400, "Bad authorization config", err)
		return
	}
	http.Redirect(w, r, authURL, 307)
}

func generatePublicID() models.PubID {
	id, err := gonanoid.Nanoid()
	logging.Error("Generating Public ID", err)
	return models.PubID(id)
}

func (h APIHandler) authRegistration(w http.ResponseWriter, authProvider string, email string, fullName string) {
	// Check if a user with this email already registered
	userList, ce := h.Controller.FindUserByEmail(email)
	if ce.HasErrors() {
		handleControllerErrors(w, 400, "Checking if user email unused", ce)
	}
	var userInfo models.User
	if len(userList) > 0 {
		//If user email already registered, check they are logging in with the correct authorization provider.
		userInfo = userList[0]
		if userInfo.AuthProvider != authProvider {
			sendErrorCode(w, 403, "User with this email has already logged in via a different provider: "+userInfo.AuthProvider, nil)
		}
		if userInfo.Username == "" {
			userInfo.Username = userInfo.Email
			h.Controller.UpdateUserByID(userInfo)
		}
		if userInfo.PublicID == "" {
			userInfo.PublicID = generatePublicID()
			h.Controller.UpdateUserByID(userInfo)
		}
	} else {
		//If not, create a new account
		userInfo = models.User{
			ID:           bson.NewObjectId(),
			PublicID:     generatePublicID(),
			Username:     email,
			FullName:     fullName,
			Email:        email,
			AuthProvider: authProvider,
			IsAdmin:      false,
			IsOwner:      false,
		}
		ce := h.Controller.AddUser(userInfo)
		if ce.HasErrors() {
			handleControllerErrors(w, 500, "Creating user in DB", ce)
		}
	}
	// Return account info in the JWT token!
	claims := jwtauth.Claims{
		"id":           userInfo.ID,
		"pid":          userInfo.PublicID,
		"uname":        userInfo.Username,
		"fullName":     userInfo.FullName,
		"email":        userInfo.Email,
		"authProvider": userInfo.AuthProvider,
		"isAdmin":      userInfo.IsAdmin,
		"isOwner":      userInfo.IsOwner,
		"acceptedTOS":  userInfo.AcceptedTOS,
	}.SetExpiryIn(3 * (time.Hour * 24)).SetIssuedNow()
	_, tokenString, _ := jwtAuthConfig.Encode(claims)
	if tokenString != "" {
		w.Write([]byte("{\"token\": \"" + tokenString + "\"}"))
	}
}

//GocialCallback receives data from the sign-in provider, and converts that to a JWT token!
func (h APIHandler) GocialCallback(w http.ResponseWriter, r *http.Request) {
	if origin := r.Header.Get("Origin"); origin != "" {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}
	authProvider := chi.URLParam(r, "provider")
	// Retrieve query params for state and code
	queryValues := r.URL.Query()
	state := queryValues.Get("state")
	code := queryValues.Get("code")
	// Handle callback and check for errors
	providerInfo, _, err := gocial.Handle(state, code)
	if err != nil {
		logging.Error("Processing login", err)
		http.Redirect(w, r, "../"+authProvider, 307)
		return
	}
	h.authRegistration(w,
		authProvider,
		providerInfo.Email,
		providerInfo.FullName,
	)
}

//Authenticator is called before the user tries to access any login-restricted areas
func (h APIHandler) Authenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		token, _, err := jwtauth.FromContext(r.Context())
		if err != nil || token == nil || !token.Valid {
			sendErrorCode(w, 401, "Invalid auth token", nil)
			return
		}
		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

//TOSWall is called before the user tries to access any TOS areas
func (h APIHandler) TOSWall(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, claims, _ := jwtauth.FromContext(r.Context())
		if claims["acceptedTOS"].(bool) != true {
			http.Error(w, "/tos", 302)
			return
		}
		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

//AdminWall is called before the user tries to access any admin-restricted areas
func (h APIHandler) AdminWall(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, claims, _ := jwtauth.FromContext(r.Context())

		if claims["isAdmin"].(bool) != true {
			sendErrorCode(w, 403, "Invalid auth token for admin access", nil)
			return
		}
		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}
