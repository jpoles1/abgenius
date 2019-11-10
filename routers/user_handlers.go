package routers

import (
	"net/http"
	"encoding/json"

	"github.com/globalsign/mgo/bson"
	"github.com/go-chi/jwtauth"
)

type limitedProfile struct {
	LearnerLevel      string        `bson:"learnerLevel" json:"learnerLevel"`
	LearnerLevelYears int           `bson:"learnerLevelYears" json:"learnerLevelYears"`	
}

//GetUserProfile handles a GET request to fetch a user's profile
func (h APIHandler) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userProfile, ce := h.Controller.FindUserByID(bson.ObjectIdHex(claims["id"].(string)))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch user profile", ce)
		return
	}
	profileData := limitedProfile {
		LearnerLevel: userProfile.LearnerLevel,
		LearnerLevelYears: userProfile.LearnerLevelYears,
	}
	sendResponseJSON(w, profileData)
}

//PostUserProfile handles a POST request to update select parameters in a user's profile
func (h APIHandler) PostUserProfile(w http.ResponseWriter, r *http.Request) {
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
	userProfile.LearnerLevel = profileData.LearnerLevel;
	userProfile.LearnerLevelYears = profileData.LearnerLevelYears;
	ce = h.Controller.UpdateUserByID(*userProfile);
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot update user profile", ce)
		return
	}
	sendResponseJSON(w, profileData)
}

