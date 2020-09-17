package routers

import (
	"github.com/jpoles1/abgenius/controllers"
	"github.com/jpoles1/abgenius/envload"
	"github.com/jpoles1/abgenius/logging"
	"encoding/json"
	"errors"
	"net/http"

	"gopkg.in/olahol/melody.v1"
)

//APIHandler takes a controller and returns a set of API handlers which utilize this controller
type APIHandler struct {
	WebSocket          *melody.Melody
	Controller         controllers.MongoController
	Production         bool
	AuthProviderConfig envload.AuthConfig
}

//AllowCrossOrigin writes a cross-origin request header if we're not in production mode, allowing the dev server to work
func (h APIHandler) AllowCrossOrigin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !h.Production {
			if origin := r.Header.Get("Origin"); origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		}
		next.ServeHTTP(w, r)
	})
}

func handleControllerErrors(w http.ResponseWriter, errCode int, msg string, ce controllers.ControllerError) error {
	if ce.DBError != nil {
		sendErrorCode(w, 500, msg+" - DB Error", ce.DBError)
		return errors.New(msg + " - DB Error")
	}
	if ce.APIError != nil {
		sendErrorCode(w, errCode, msg+" - API Error", ce.APIError)
		return errors.New(msg + " - API Error")
	}
	if ce.ReqError != nil {
		sendErrorCode(w, errCode, msg+" - Request Error", ce.ReqError)
		return errors.New(msg + " - Request Error")
	}
	return nil
}
func sendErrorCode(w http.ResponseWriter, errCode int, msg string, err error) {
	http.Error(w, http.StatusText(errCode)+" - "+msg, errCode)
	if err != nil {
		logging.Error(msg, err)
	}
}

func sendResponseJSON(w http.ResponseWriter, data interface{}) (err error) {
	responseString, err := json.Marshal(data)
	if err != nil {
		sendErrorCode(w, 500, "Marshalling data to json", err)
		return
	}
	w.Write(responseString)
	return
}
