package controllers

import (
	"abgenius/models"

	mgo "github.com/globalsign/mgo"
)

//InsertAnswer runs a DB query to create or insert an answer document
func (mc MongoController) InsertAnswer(answer models.Answer) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("recipes")
	ce.APIError = collection.Insert(answer)
	return
}
