package models

import "github.com/globalsign/mgo/bson"

//PubID is a an externally facing unique identifier for a user
type PubID string

//User stores data regarding a user of the system, and also their login provider.
type User struct {
	ID                bson.ObjectId `bson:"_id,omitempty" json:"id"`
	PublicID          PubID         `bson:"pid" json:"pid"`
	Username          string        `bson:"uname" json:"uname"`
	FullName          string        `bson:"fullName" json:"fullName"`
	Email             string        `bson:"email" json:"email"`
	AuthProvider      string        `bson:"authProvider" json:"authProvider"`
	LearnerLevel      string        `bson:"learnerLevel" json:"learnerLevel"`
	LearnerLevelYears int           `bson:"learnerLevelYears" json:"learnerLevelYears"`
	IsAdmin           bool          `bson:"isAdmin" json:"isAdmin"`
	IsOwner           bool          `bson:"isOwner" json:"isOwner"`
	AcceptedTOS       bool          `bson:"acceptedTOS" json:"acceptedTOS"`
}
