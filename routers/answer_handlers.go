package routers

import (
	"github.com/jpoles1/abgenius/models"
	"encoding/json"
	"net/http"

	"github.com/globalsign/mgo/bson"
	"github.com/go-chi/jwtauth"
)

//PostSubmitAnswer handles a POST request to submit a response to an ABG question
func (h APIHandler) PostSubmitAnswer(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	var answerData models.Answer
	err := json.NewDecoder(r.Body).Decode(&answerData)
	if err != nil {
		sendErrorCode(w, 400, "Attempting to decode request body json", err)
		return
	}
	answerData.ID = bson.NewObjectId()
	answerData.LearnerID = bson.ObjectIdHex(claims["id"].(string))
	ce := h.Controller.InsertAnswer(answerData)
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot create answer entry", ce)
		return
	}
	sendResponseJSON(w, map[string]interface{}{
		"answerID": answerData.ID,
	})
}

//GetUserAnswers handles a GET request to fetch a list of their responses
func (h APIHandler) GetUserAnswers(w http.ResponseWriter, r *http.Request) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	answerList, ce := h.Controller.FindAnswersByQuery(bson.M{
		"lid": bson.ObjectIdHex(claims["id"].(string)),
	})
	if ce.HasErrors() {
		handleControllerErrors(w, 500, "Cannot fetch answer list", ce)
		return
	}
	sendResponseJSON(w, answerList)
}
