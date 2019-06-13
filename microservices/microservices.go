package microservices

import (
	"sync"
	"time"
)

//ChronMicroservice creates a microservice function which runs periodically
func ChronMicroservice(chronTask func(), updateDelay time.Duration, runOnStartup bool) {
	if runOnStartup {
		go chronTask()
	}
	ticker := time.NewTicker(updateDelay)
	for range ticker.C {
		go chronTask()
	}
}

//StartMicroserviceGroup creates a sync.WaitGroup which waits for the end of all microservices to finish
func StartMicroserviceGroup(microservices []func()) *sync.WaitGroup {
	//Create a wait group for all microservices
	var wg sync.WaitGroup
	wg.Add(len(microservices))

	//create a thread for each microservice
	for _, microservice := range microservices {
		localmicroservice := microservice
		go func() {
			defer wg.Done()
			localmicroservice()
		}()
	}

	//wait for all microservices to complete
	return &wg
}
