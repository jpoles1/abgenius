package logging

import (
	"errors"
	"testing"
)

func TestLoadSentry(t *testing.T) {
	LoadSentry("")
}
func TestErrCheck(t *testing.T) {
	Error("Testing error logging function!", errors.New("Test error"))
	Fatal("Testing fatal error logging function!", nil)
}
