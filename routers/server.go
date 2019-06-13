package routers

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/fatih/color"
	"github.com/go-chi/chi"
	"github.com/go-chi/docgen"
)

var routes = flag.Bool("routes", false, "Generate router documentation")

//WebServer is an entity containing a router and the ip:port to bind it to
type WebServer struct {
	Router   chi.Router
	BindIP   string
	BindPort string
}

//Serve routes HTTP requests to the mux
func (ws *WebServer) Serve(apiHandler APIHandler) {
	workDir, _ := os.Getwd()
	//Allow cross-origin requests in non-production environment
	ws.Router.Use(apiHandler.AllowCrossOrigin)

	distDir := filepath.Join(workDir, "/frontend/dist")
	ws.Router.Get("/*", vueServer(distDir, apiHandler.Production))

	ws.Router.Route("/api", func(r chi.Router) {
		APIRouter(r, apiHandler)
	})

	if *routes {
		// fmt.Println(docgen.JSONRoutesDoc(r))
		fmt.Println(docgen.MarkdownRoutesDoc(ws.Router, docgen.MarkdownOpts{
			ProjectPath: "github.com/jpoles1/abgenius",
			Intro:       "Welcome to the ABGenius router docs.",
		}))
		return
	}
	if ws.BindPort != "test" && ws.BindIP != "test" {
		color.Green("Starting Web server on port: %s", ws.BindPort)
		color.Green("Access the web server at: http://%s:%s", ws.BindIP, ws.BindPort)
		log.Fatal(http.ListenAndServe(ws.BindIP+":"+ws.BindPort, ws.Router))
		fmt.Println("Terminating TransitSign Web Server...")
	}
}
