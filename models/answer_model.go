package models

import "github.com/globalsign/mgo/bson"

//Answer stores data for an answer to an ABG question
type Answer struct {
	ID           bson.ObjectId `bson:"_id" json:"_id"`
	LearnerID    bson.ObjectId `bson:"lid" json:"lid"`
	Learner      []string      `bson:"learner" json:"learner"`
	Genius       []string      `bson:"genius" json:"genius"`
	TimeElapsed  int           `bson:"timeElapsed" json:"timeElapsed"`
	PeekedAtGaps bool          `bson:"peekedAtGaps" json:"peekedAtGaps"`
	Grade        int           `bson:"grade" json:"grade"`
}
