locals {
  function_basename = replace(var.lambda_function_name, "/${var.api_id}-?/", "")
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = var.api_id
  route_key = "${var.method} ${var.route}"
  target    = "integrations/${aws_apigatewayv2_integration.default.id}"

  authorizer_id        = var.authorizer_id
  authorization_scopes = var.authorizer_type == "JWT" ? var.authorization_scopes : null
  authorization_type   = var.authorizer_type
}

resource "aws_apigatewayv2_integration" "default" {
  api_id                 = var.api_id
  integration_uri        = var.lambda_function_invoke_arn
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  credentials_arn        = aws_iam_role.default.arn
  payload_format_version = "2.0"
}

# To allow the Lambda function to be invoked
resource "aws_lambda_permission" "http_api" {
  statement_id  = "ExecutionFromAPIGateway-${var.api_id}"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.api_arn
}

resource "aws_iam_role" "default" {
  name = "${var.api_id}-${local.function_basename}-integration"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
        Effect    = "Allow"
      }
    ]
  })
}

# To allow API Gateway to invoke the Lambda function
resource "aws_iam_role_policy" "lambda_invoke" {
  name = "${var.api_id}-${local.function_basename}-lambdaInvoke"
  role = aws_iam_role.default.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = var.lambda_function_arn
        Effect   = "Allow"
      },
    ]
  })
}
