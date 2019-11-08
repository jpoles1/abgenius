package routers

import (
	"net/http"

	"github.com/globalsign/mgo/bson"
	"github.com/go-chi/jwtauth"
)

//GetUserProfile handles a GET request to fetch a user's profile
func (h APIHandler) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userProfile, ce := h.Controller.FindUserByID(bson.ObjectIdHex(claims["id"].(string))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch answer list", ce)
		return
	}
	sendResponseJSON(w, answerList)
}
