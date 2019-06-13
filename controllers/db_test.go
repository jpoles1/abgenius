package controllers

import (
	"abgenius/envload"
	"abgenius/logging"
	"testing"
)

func TestDBLoad(t *testing.T) {
	envConfig, err := envload.LoadEnv("../.env")
	logging.Fatal("Fetching env config", err)
	mc := MongoController{envConfig.MongoURI, "abgenius-test", nil}
	mc.SessionClone()
}
