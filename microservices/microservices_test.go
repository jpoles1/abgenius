package microservices

import (
	"fmt"
	"testing"
)

func TestStartMicroserviceGroup(t *testing.T) {
	microservices := []func(){func() { fmt.Println("Microservice test!") }}
	wg := StartMicroserviceGroup(microservices)
	wg.Wait()
}
