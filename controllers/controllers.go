package controllers

import (
	"abgenius/logging"
	"errors"

	"github.com/fatih/color"
	mgo "github.com/globalsign/mgo"
)

//MongoController is an implementation of a controller interface (not yet defined) which has the info needed to connect to a DB.
type MongoController struct {
	MongoURI  string
	DBName    string
	DBSession *mgo.Session
}

//SessionClone clones a MongoDB session for running DB queries!
func (mc *MongoController) SessionClone() (sesh *mgo.Session, err error) {
	if mc.DBSession == nil {
		mongoConnect(mc)
	}
	if mc.DBSession == nil {
		err = errors.New("Could not connect to MongoDB")
		logging.Error("Connecting to MongoDB", err)
		return
	}
	return mc.DBSession.Clone(), nil
}

//EnsureCollectionIndex enforces indexes on the various MongoDB collections
func (mc *MongoController) EnsureCollectionIndex(collectionName string) (c *mgo.Collection, err error) {
	var index mgo.Index
	if collectionName == "recipes" {
		index = mgo.Index{
			Key: []string{"$text:name", "$text:desc"},
		}
	}
	sesh, err := mc.SessionClone()
	if err != nil {
		logging.Fatal("Ensuring \""+collectionName+"\" index", err)
		return
	}
	defer sesh.Close()
	c = sesh.DB(mc.DBName).C(collectionName)

	err = c.EnsureIndex(index)
	if err != nil {
		logging.Error("Ensuring \""+collectionName+"\" index", err)
		return
	}
	color.Green("Ensured index for collection \"" + collectionName + "\"")
	return
}

//ControllerError is used to report back whether a controller has had a DB connection error, an error with the API request, or an error in the API itself.
type ControllerError struct {
	DBError  error
	ReqError error
	APIError error
}

//FirstError returns the first error encountered in the list of controller errors and returns nil if none are present
func (ce ControllerError) FirstError() error {
	if ce.DBError != nil {
		return ce.DBError
	}
	if ce.APIError != nil {
		return ce.APIError
	}
	if ce.ReqError != nil {
		return ce.ReqError
	}
	return nil
}

//HasErrors checks if any of the error fields are not nil.
func (ce ControllerError) HasErrors() bool {
	return ce.DBError != nil || ce.ReqError != nil || ce.APIError != nil
}
