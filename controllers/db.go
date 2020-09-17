package controllers

import (
	"github.com/jpoles1/abgenius/logging"
	"time"

	mgo "github.com/globalsign/mgo"
)

func mongoConnect(mc *MongoController) {
	newSession, err := mgo.DialWithTimeout(mc.MongoURI, 500*time.Millisecond)
	if err != nil {
		logging.Error("Connecting to MongoDB", err)
	}
	mc.DBSession = newSession
}
