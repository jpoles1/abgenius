package controllers

import (
	"github.com/jpoles1/abgenius/envload"
	"github.com/jpoles1/abgenius/logging"
	"testing"
)

func TestDBLoad(t *testing.T) {
	envConfig, err := envload.LoadEnv("../.env")
	logging.Fatal("Fetching env config", err)
	mc := MongoController{envConfig.MongoURI, "abgenius-test", nil}
	mc.SessionClone()
}
