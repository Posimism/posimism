package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"utils/helpers"
	"utils/httpapi"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var (
	ddbClient   *dynamodb.Client
	errorLogger *log.Logger
)

func init() {
	helpers.CheckEnvVals([]string{"LOCK_TABLE"})
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		panic("unable to load SDK config, " + err.Error())
	}
	ddbClient = dynamodb.NewFromConfig(cfg)
	errorLogger = log.New(os.Stderr, "ERROR ", log.Ldate|log.Ltime|log.Lshortfile)
	httpapi.Init(&httpapi.GlobalVars{ErrorLogger: errorLogger})
}

func handleRequest(ctx context.Context, event json.RawMessage) (events.APIGatewayV2HTTPResponse, error) {
	parsedEvent := new(events.APIGatewayV2HTTPRequest)
	if err := json.Unmarshal(event, parsedEvent); err != nil {
		errorTxt := fmt.Sprintf("Failed to unmarshal event: %v", err)
		errorLogger.Println(errorTxt)
		return httpapi.ClientError(http.StatusBadRequest)
	}

	lock, ok := parsedEvent.PathParameters["lock"]
	if !ok {
		return httpapi.ClientError(http.StatusBadRequest)
	}

	if _, err := ddbClient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(os.Getenv("LOCK_TABLE")),
		Item:      map[string]types.AttributeValue{"key": &types.AttributeValueMemberS{Value: lock}},
	}); err != nil {
		return httpapi.ServerError(err)
	}

	return events.APIGatewayV2HTTPResponse{StatusCode: 200}, nil
}

func main() {
	lambda.Start(handleRequest)
}
