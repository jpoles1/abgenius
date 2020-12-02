package controllers

import (
	"github.com/jpoles1/abgenius/models"

	mgo "github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

//AddVQPresetList runs a DB query to produce a new document in the vqpresets collection
func (mc MongoController) AddVQPresetList(newPresetList models.VQPresetList) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("vqpresets")
	ce.APIError = collection.Insert(&newPresetList)
	return
}

//FindVQPresetListByID runs a DB query to fetch a vqpresets document with a given ID
func (mc MongoController) FindVQPresetListByID(id bson.ObjectId) (result models.VQPresetList, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("vqpresets")
	ce.APIError = collection.FindId(id).All(&result)
	return
}

//FindVQPresetListsByUserID runs a DB query to fetch a list of vqpresets document belonging to a given user
func (mc MongoController) FindVQPresetListsByUserID(userID bson.ObjectId) (result []models.VQPresetList, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("vqpresets")
	ce.APIError = collection.Find(bson.M{"uid": userID}).All(&result)
	return
}

//UpdateVQPresetList runs a DB query to update a VQPresetList
func (mc MongoController) UpdateVQPresetList(updatedPresetList models.VQPresetList) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("vqpresets")
	collection.UpdateId(updatedPresetList.ID, updatedPresetList)
	return
}
