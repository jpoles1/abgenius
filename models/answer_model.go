package models

import "github.com/globalsign/mgo/bson"

//Answer stores data for an answer to an ABG question
type Answer struct {
	ID        bson.ObjectId `bson:"_id" json:"_id"`
	LearnerID bson.ObjectId `bson:"lid" json:"lid"`
	Learner   [][]string    `bson:"learner" json:"learner"`
	Genus     [][]string    `bson:"genius" json:"genius"`
}
