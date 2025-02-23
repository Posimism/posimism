module main

go 1.23.3

replace utils => ../../_utils

require (
	github.com/aws/aws-lambda-go v1.47.0
	utils v0.0.0-00010101000000-000000000000
)
