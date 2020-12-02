package models

import "github.com/globalsign/mgo/bson"

//VQPreset stores an array of vqpairs which represent a lung in a specific disease state
type VQPreset struct {
	ID      bson.ObjectId `bson:"_id" json:"_id"`
	Name    string        `bson:"name" json:"name"`
	VQPairs [][2]float32  `bson:"pairs" json:"pairs"`
}

//VQPresetList stores a collection of lung VQ presets for the VQSim
type VQPresetList struct {
	ID      bson.ObjectId `bson:"_id" json:"_id"`
	UserID  bson.ObjectId `bson:"uid" json:"uid"`
	Name    string        `bson:"name" json:"name"`
	Presets []VQPreset    `bson:"presets" json:"presets"`
}
