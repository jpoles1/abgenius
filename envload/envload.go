package envload

import (
	"abgenius/logging"
	"errors"
	"fmt"
	"os"
	"strconv"

	"github.com/fatih/color"
	"github.com/subosito/gotenv"
)

//ABGeniusConfig is used to describe the configuration state of the Go server
type ABGeniusConfig struct {
	Production bool
	BindPort   string
	BindIP     string
	BindURL    string
	JWTSecret  string
	MongoURI   string
	SMTPURI    string
	SMTPPort   int
	SMTPSender string
	SMTPPass   string
	SentryDSN  string
}

func loadBoolEnv(varName string) bool {
	if os.Getenv(varName) == "" {
		color.Yellow(fmt.Sprintf("Missing %s value in .env file, automatically setting to false.\nSet a boolean value for %s in your .env file to disable this warning.", varName, varName))
		return false
	}
	boolEnv, err := strconv.ParseBool(os.Getenv(varName))
	if err != nil {
		color.Yellow(fmt.Sprintf("%s value must be a valid bool (true or false)\n Automatically setting to false.", varName))
		return false
	}
	return boolEnv

}
func loadStringEnv(varName string) string {
	if os.Getenv(varName) == "" {
		logging.Fatal(fmt.Sprintf("Missing %s value in .env file.", varName), errors.New("No such string var defined"))
	}
	return os.Getenv(varName)
}

/*func loadIntEnv(varName string) int {
	stringEnv, found := os.LookupEnv(varName)
	if !found {
		log.Fatal(fmt.Sprintf("Missing %s value in .env file.", varName))
	}
	intEnv, err := strconv.Atoi(stringEnv)
	if err != nil {
		log.Fatal(fmt.Sprintf("%s value must be an integer.", varName))
	}
	return intEnv
}*/

//AuthConfig is an alias for authorization config datatype
type AuthConfig map[string]map[string]string

//LoadAuthConfig will load in an env file containing the private info required for gocial sign-on
func LoadAuthConfig(filenames ...string) (authConfig AuthConfig, err error) {
	err = gotenv.Load(filenames...)
	if err != nil {
		logging.Error("Error loading .env file: ", err)
		return
	}
	authConfig = map[string]map[string]string{
		"google": {
			"clientID":     loadStringEnv("GOOGLE_CLIENT_ID"),
			"clientSecret": loadStringEnv("GOOGLE_CLIENT_SECRET"),
			"callbackURL":  loadStringEnv("GOOGLE_CALLBACK_URL"),
		},
	}
	return
}

//LoadEnv uses gotenv to pull in the env files specified in the args, and returns a config struct
func LoadEnv(filenames ...string) (ABGeniusConfig, error) {
	//Load Env
	err := gotenv.Load(filenames...)
	if err != nil {
		logging.Error("Error loading .env file: ", err)
		return ABGeniusConfig{}, err
	}
	//Setup global env variables
	config := ABGeniusConfig{
		Production: loadBoolEnv("PRODUCTION"),
		BindPort:   loadStringEnv("BIND_PORT"),
		BindIP:     loadStringEnv("BIND_IP"),
		BindURL:    loadStringEnv("BIND_URL"),
		JWTSecret:  loadStringEnv("JWT_SECRET"),
		MongoURI:   loadStringEnv("MONGO_URI"),
		//SentryDSN:  loadStringEnv("SENTRY_DSN"),
		/*SMTPURI:         loadStringEnv("SMTP_SERVER"),
		SMTPPort:        loadIntEnv("SMTP_PORT"),
		SMTPSender:      loadStringEnv("SMTP_SENDER"),
		SMTPPass:        loadStringEnv("SMTP_PASS"),*/
	}
	return config, nil
}

/*func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}*/
