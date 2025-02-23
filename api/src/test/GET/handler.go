package main

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"utils/httpapi"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var (
	errorLogger *log.Logger
)

func init() {
	errorLogger = log.New(os.Stderr, "ERROR ", log.Ldate|log.Ltime|log.Lshortfile)
	httpapi.Init(&httpapi.GlobalVars{ErrorLogger: errorLogger})
}

func handleRequest(ctx context.Context, event json.RawMessage) (events.APIGatewayV2HTTPResponse, error) {
	// parsedEvent := new(events.APIGatewayV2HTTPRequest)
	// if err := json.Unmarshal(event, parsedEvent); err != nil {
	// 	errorTxt := fmt.Sprintf("Failed to unmarshal event: %v", err)
	// 	errorLogger.Println(errorTxt)
	// 	return httpapi.ClientError(http.StatusBadRequest)
	// }

	body, err := json.Marshal(map[string]string{"message": "hello from lambda!"})
	if err != nil {
		httpapi.ServerError(err)
	}
	return events.APIGatewayV2HTTPResponse{Body: string(body), StatusCode: 200}, nil
}

func main() {
	lambda.Start(handleRequest)
}
