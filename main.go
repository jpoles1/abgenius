package main

import (
	"abgenius/controllers"
	"abgenius/envload"
	"abgenius/microservices"
	"abgenius/routers"
	"math"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	melody "gopkg.in/olahol/melody.v1"
)

func main() {
	//Load environment variables
	envConfig, _ := envload.LoadEnv(".env")
	//Enable logging with Sentry
	//logging.LoadSentry(envConfig.SentryDSN)
	//Ensure authorization config setup properly
	authConfig, err := envload.LoadAuthConfig()
	if err != nil {
		panic(err)
	}
	//Instantiate Melody websockets
	var melodyInstance = melody.New()
	melodyInstance.Config.MaxMessageSize = 10 * int64(math.Pow(10, 6)) //Megabytes
	//Instantiate MongoDB controller
	mongoController := controllers.MongoController{
		MongoURI: envConfig.MongoURI,
		DBName:   "abgenius",
	}
	//Instantiate API handler
	apiHandler := routers.APIHandler{
		WebSocket:          melodyInstance,
		Controller:         mongoController,
		Production:         envConfig.Production,
		AuthProviderConfig: authConfig,
	}
	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.URLFormat)

	webServer := routers.WebServer{
		Router:   router,
		BindIP:   envConfig.BindIP,
		BindPort: envConfig.BindPort,
	}
	wg := microservices.StartMicroserviceGroup([]func(){
		func() { webServer.Serve(apiHandler) },
	})
	wg.Wait()
}
