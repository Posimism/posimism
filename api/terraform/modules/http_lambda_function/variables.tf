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

variable "architecture" {
  description = "The architecture for the lambda function"
  type        = string
  default     = "arm64"
}

variable "code_dir" {
  description = "The directory containing the lambda function workspace"
  type        = string
}

variable "description" {
  description = "The description for the lambda function"
  type        = string
  default     = ""
}

variable "environment_variables" {
  description = "The environment variables for the lambda function"
  type        = map(string)
  default     = {}
}

variable "handler" {
  description = "The handler for the lambda function"
  type        = string
  default     = "handler.handler"
}

variable "iam_policies" {
  description = "List of AWS IAM policy arns"
  type        = list(string)
  default     = []
}

variable "layer_arns" {
  description = "List of AWS Lambda Layer ARNs"
  type        = list(string)
  default     = []
}

variable "memory_size" {
  description = "The memory size for the lambda function"
  type        = number
  default     = 128
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

variable "runtime" {
  description = "The runtime for the lambda function"
  type        = string
  default     = "nodejs20.x"
}

variable "timeout" {
  description = "The timeout for the lambda function"
  type        = number
  default     = 10
}

variable "zip_dir" {
  description = "the directory relative to code_dir to be zipped and deployed after make"
  type        = string
  default     = "dist"
}
