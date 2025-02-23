package helpers

import (
	"fmt"
	"os"
)

func CheckEnvVals(mandatoryEnvVars ...[]string) {
	for _, chunk := range mandatoryEnvVars {
		for _, envVar := range chunk {
			if os.Getenv(envVar) == "" {
				panic(fmt.Errorf("missing env var %s", envVar))
			}
		}
	}
}
