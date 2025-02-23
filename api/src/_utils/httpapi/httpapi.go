package httpapi

import (
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
)

var errorLogger *log.Logger

type GlobalVars struct {
	ErrorLogger *log.Logger
}

func Init(globalVars *GlobalVars) {
	if globalVars.ErrorLogger == nil {
		globalVars.ErrorLogger = log.New(os.Stderr, "ERROR ", log.Ldate|log.Ltime|log.Lshortfile)
	}
	errorLogger = globalVars.ErrorLogger
}

// Add a helper for handling errors. This logs any error to os.Stderr
// and returns a 500 Internal Server Error response that the AWS API
// Gateway understands.
func ServerError(err error) (events.APIGatewayV2HTTPResponse, error) {
	errorLogger.Println(err.Error())
	statusCode := http.StatusInternalServerError

	return events.APIGatewayV2HTTPResponse{
		StatusCode: statusCode,
		Body:       http.StatusText(http.StatusInternalServerError),
	}, nil
}

// Similarly add a helper for send responses relating to client errors.
func ClientError(status int) (events.APIGatewayV2HTTPResponse, error) {
	return events.APIGatewayV2HTTPResponse{
		StatusCode: status,
		Body:       http.StatusText(status),
	}, nil
}
