package controllers

import (
	"abgenius/models"

	mgo "github.com/globalsign/mgo"
	"github.com/globalsign/mgo/bson"
)

//AddUser runs a DB query to produce a new document in the users collection
func (mc MongoController) AddUser(newUser models.User) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("users")
	ce.APIError = collection.Insert(&newUser)
	return
}

//AcceptTOS will set the acceptedTOS value to true for a given userID
func (mc MongoController) AcceptTOS(userID bson.ObjectId) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("users")
	ce.APIError = collection.UpdateId(userID, bson.M{"$set": bson.M{"acceptedTOS": true}})
	if ce.APIError != nil {
		return
	}
	return
}

//FindUserByEmail searches the DB for users with a given email address
func (mc MongoController) FindUserByEmail(email string) (userList []models.User, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	searchParams := bson.M{"email": email}
	collection := mongoConn.DB(mc.DBName).C("users")
	ce.APIError = collection.Find(searchParams).All(&userList)
	return
}

//FetchUserList runs a DB query to fetch a list of users matching the bson.M search params
func (mc MongoController) FetchUserList(searchParams bson.M) (result []models.User, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("users")
	ce.APIError = collection.Find(searchParams).Sort("-_id").All(&result)
	return
}

//FindUserByID runs a DB query to fetch a users document with a given ID
func (mc MongoController) FindUserByID(userID bson.ObjectId) (result *models.User, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("users")
	ce.APIError = collection.FindId(userID).One(&result)
	return
}

//FindUserByPublicID runs a DB query to fetch a users document with a given PublicID
func (mc MongoController) FindUserByPublicID(publicID models.PubID) (result *models.User, ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("users")
	ce.APIError = collection.Find(bson.M{"pid": publicID}).One(&result)
	return
}

//UpdateUserByID runs a DB query to update a user's profile using their UID
func (mc MongoController) UpdateUserByID(updatedUser models.User) (ce ControllerError) {
	var mongoConn *mgo.Session
	mongoConn, ce.DBError = mc.SessionClone()
	defer mongoConn.Close()
	if ce.DBError != nil {
		return
	}
	collection := mongoConn.DB(mc.DBName).C("users")
	collection.UpdateId(updatedUser.ID, updatedUser)
	return
}
