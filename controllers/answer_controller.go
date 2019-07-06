package controllers

import (
	"abgenius/models"

	mgo "github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

//InsertAnswer runs a DB query to create or insert an answer document
func (mc MongoController) InsertAnswer(answer models.Answer) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("answers")
	ce.APIError = collection.Insert(answer)
	return
}

//FindAnswersByQuery runs a DB query to retreive answer documents matching given search parameters
func (mc MongoController) FindAnswersByQuery(searchParams bson.M) (results []models.Answer, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("answers")
	ce.APIError = collection.Find(searchParams).Sort("-_id").All(&results)
	return
}