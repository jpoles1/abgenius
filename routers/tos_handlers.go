package routers

import (
	"net/http"

	"github.com/go-chi/jwtauth"
	"github.com/globalsign/mgo/bson"
)

//GetAcceptTOS accepts a request to accept the TOS for the user's account
func (h APIHandler) GetAcceptTOS(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userID := bson.ObjectIdHex(claims["id"].(string))
	ce := h.Controller.AcceptTOS(userID)
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Accepting TOS", ce)
		return
	}
	claims["acceptedTOS"] = true
	_, tokenString, _ := jwtAuthConfig.Encode(claims)
	w.Write([]byte("{\"token\": \"" + tokenString + "\"}"))
}
