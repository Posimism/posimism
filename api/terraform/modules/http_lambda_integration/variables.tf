variable "api_arn" {
  description = "The ARN of the API Gateway"
  type        = string
}

variable "api_id" {
  description = "The ID of the API Gateway"
  type        = string
}

variable "authorizer_id" {
  description = "The ID of the authorizer"
  type        = string
  default     = ""
}

variable "authorization_scopes" {
  description = "The authorization scopes"
  type        = list(string)
  default     = []
}

variable "authorizer_type" {
  description = "The type of authorizer. Valid values are 'CUSTOM', 'AWS_IAM', and 'JWT'"
  type        = string
  default     = "NONE"
}

variable "lambda_function_arn" {
  description = "The ARN of the Lambda function"
  type        = string
}

variable "lambda_function_invoke_arn" {
  description = "The invoke_ARN of the Lambda function"
  type        = string
}

variable "lambda_function_name" {
  description = "The function_name of the Lambda function"
  type        = string
}

variable "method" {
  description = "The HTTP method"
  type        = string
  default     = "GET"
}

variable "route" {
  description = "The route"
  type        = string
  default     = "/"
}
