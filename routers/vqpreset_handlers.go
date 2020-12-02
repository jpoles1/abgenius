package routers

import (
	"github.com/jpoles1/abgenius/models"

	"encoding/json"
	"net/http"

	"github.com/globalsign/mgo/bson"
	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
)

//GetVQPresetList handles a GET request to fetch a VQ preset by ID
func (h APIHandler) GetVQPresetList(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	preset, ce := h.Controller.FindVQPresetListByID(bson.ObjectIdHex(id))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch VQ preset list", ce)
		return
	}
	sendResponseJSON(w, preset)
}

//GetMyVQPresetLists handles a GET request to fetch the user's owned VQ presets
func (h APIHandler) GetMyVQPresetLists(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	presets, ce := h.Controller.FindVQPresetListsByUserID(bson.ObjectIdHex(claims["id"].(string)))
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch VQ preset lists", ce)
		return
	}
	sendResponseJSON(w, presets)
}

//PostUdpateVQPresetList handles a POST request to update select parameters in a VQPresetList
func (h APIHandler) PostUdpateVQPresetList(w http.ResponseWriter, r *http.Request) {
	var updatedPresetList models.VQPresetList
	err := json.NewDecoder(r.Body).Decode(&updatedPresetList)
	if err != nil {
		sendErrorCode(w, 400, "Attempting to decode request body json", err)
		return
	}
	_, claims, _ := jwtauth.FromContext(r.Context())
	if updatedPresetList.UserID != bson.ObjectIdHex(claims["id"].(string)) {
		sendErrorCode(w, 400, "Invalid user id in request body json", err)
	}
	oldPresetList, ce := h.Controller.FindVQPresetListByID(updatedPresetList.ID)
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch current preset list", ce)
		return
	}
	if oldPresetList.UserID != bson.ObjectIdHex(claims["id"].(string)) {
		sendErrorCode(w, 401, "Cannot edit preset list owned by another user", nil)
		return
	}
	ce = h.Controller.UpdateVQPresetList(updatedPresetList)
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Updating VQPresetList", ce)
		return
	}
	sendResponseJSON(w, updatedPresetList)
}
