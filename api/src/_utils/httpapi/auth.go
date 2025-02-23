package httpapi

import (
	"errors"
	"fmt"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
)

var (
	ErrMissingClaim = errors.New("Missing Claim")
)

func createMissingClaim(claim string) error {
	return fmt.Errorf("%w: %s", ErrMissingClaim, claim)
}

type JWTClaims struct {
	Sub   string
	Email string
}

func CheckJWTClaims(authorizer *events.APIGatewayV2HTTPRequestContextAuthorizerDescription) (*JWTClaims, error) {
	if authorizer == nil {
		return nil, errors.New("no authorization")
	}
	if authorizer.JWT == nil {
		return nil, errors.New("no JWT")
	}
	claims := authorizer.JWT.Claims
	sub, ok := claims["Sub"]
	if !ok {
		return nil, createMissingClaim("Sub")
	}
	email, ok := claims["Email"]
	if !ok {
		return nil, createMissingClaim("Email")
	}
	emailVerifiedStr, ok := claims["EmailVerified"]
	if emailVerified, err := strconv.ParseBool(emailVerifiedStr); !ok || err != nil || !emailVerified {
		return nil, createMissingClaim("EmailVerified")
	}
	return &JWTClaims{Sub: sub, Email: email}, nil
}
