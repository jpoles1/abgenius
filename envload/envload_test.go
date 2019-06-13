package envload

import (
	"testing"
)

func TestLoadEnv(t *testing.T) {
	_, err := LoadEnv("../.env")
	if err != nil {
		t.Error("Could not find .env file for testing.")
	}
	config, _ := LoadEnv("test.env")
	emptyConfig := ABGeniusConfig{}
	if config != emptyConfig {
		t.Error("Does not return empty config for non-existant env file.")
	}
}
func TestLoadBoolEnv(t *testing.T) {
	if loadBoolEnv("test") != false {
		t.Error("Does not return false for non-existant env var")
	}
	if loadBoolEnv("BIND_IP") != false {
		t.Error("Does not return false for non-bool env var")
	}
}

/*func TestLoadStringEnv(t *testing.T) {
	if loadStringEnv("test") != "" {
		t.Error("Does not return empty string for non-existant env var")
	}
}*/
