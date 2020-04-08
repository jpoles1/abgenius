package routers

import (
	"encoding/json"
	"net/http"

	"github.com/globalsign/mgo/bson"
	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
)

type limitedProfile struct {
	LearnerLevel      string `bson:"learnerLevel" json:"learnerLevel"`
	LearnerLevelYears int    `bson:"learnerLevelYears" json:"learnerLevelYears"`
}

//GetMyProfile handles a GET request to fetch a user's profile
func (h APIHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userProfile, ce := h.Controller.FindUserByID(bson.ObjectIdHex(claims["id"].(string)))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch user profile", ce)
		return
	}
	profileData := limitedProfile{
		LearnerLevel:      userProfile.LearnerLevel,
		LearnerLevelYears: userProfile.LearnerLevelYears,
	}
	sendResponseJSON(w, profileData)
}

//PostMyProfile handles a POST request to update select parameters in a user's profile
func (h APIHandler) PostMyProfile(w http.ResponseWriter, r *http.Request) {
	var profileData limitedProfile
	err := json.NewDecoder(r.Body).Decode(&profileData)
	if err != nil {
		sendErrorCode(w, 400, "Attempting to decode request body json", err)
		return
	}
	_, claims, _ := jwtauth.FromContext(r.Context())
	userProfile, ce := h.Controller.FindUserByID(bson.ObjectIdHex(claims["id"].(string)))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch user profile", ce)
		return
	}
	userProfile.LearnerLevel = profileData.LearnerLevel
	userProfile.LearnerLevelYears = profileData.LearnerLevelYears
	ce = h.Controller.UpdateUserByID(*userProfile)
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot update user profile", ce)
		return
	}
	sendResponseJSON(w, profileData)
}

//GetUserList fetches the list of all users and their metadata (FOR ADMIN ACCESS ONLY)
func (h APIHandler) GetUserList(w http.ResponseWriter, r *http.Request) {
	userList, ce := h.Controller.FetchUserList(bson.M{})
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Fetching user list", ce)
		return
	}
	sendResponseJSON(w, userList)
}

//GetUserProfile allows an admin to fetch the entire profile info for a given user ID (FOR ADMIN ACCESS ONLY)
func (h APIHandler) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	if !bson.IsObjectIdHex(userID) {
		sendErrorCode(w, 400, "Invalid user ID", nil)
		return
	}
	userProfile, ce := h.Controller.FindUserByID(bson.ObjectIdHex(userID))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Fetching user profile", ce)
		return
	}
	sendResponseJSON(w, userProfile)
}
