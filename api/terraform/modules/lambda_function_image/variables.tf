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

variable "CMD" {
  description = "CMD override. In this case, the path to the handler for the lambda function"
  type        = list(string)
  default     = ["index.handler"]
}

variable "iam_policies" {
  description = "List of AWS IAM policy arns"
  type        = list(string)
  default     = []
}

variable "ignore_dirs" {
  description = "directories to ignore when triggering update"
  type        = list(string)
  default     = ["node_modules", "dist", "tests"]
}

variable "ignore_files" {
  description = "files to ignore when triggering update"
  type        = list(string)
  default     = ["package-lock.json", "tsconfig.tsbuildinfo", "go.sum"]
}

variable "image_tag" {
  description = "The full image tag of the lambda function image after it's built and beforee it's pushed"
  type        = string
}

variable "layer_arns" {
  description = "List of AWS Lambda Layer ARNs"
  type        = list(string)
  default     = []
}

variable "log_group_retention" {
  description = "The retention period for the CloudWatch log group"
  type        = number
  default     = 90
}

variable "memory_size" {
  description = "The memory size for the lambda function"
  type        = number
  default     = 128
}

variable "name" {
  description = "The (sanitized) name of the lambda function"
  type        = string
}

variable "timeout" {
  description = "The timeout for the lambda function"
  type        = number
  default     = 10
}
