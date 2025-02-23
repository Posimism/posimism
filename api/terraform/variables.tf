variable "access_token" {
  description = "The access token for the repo"
  type        = string
  sensitive   = true
}

variable "build_dir" {
  description = "The build directory for the website"
  type        = string
}

variable "basic_auth_credentials" {
  description = "The basic auth credentials for non-production environments"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "The domain name for the website"
  type        = string
}

variable "http_api_domain_mapping_key" {
  description = "The key for the domain mapping for the API. Include prefix '/'"
  type        = string
  default     = ""
}

variable "http_api_prefix" {
  description = "The prefix for the API. Exclude trailing dot."
  type        = string
  default     = "api"
}

variable "http_api_stage" {
  description = "The stage for the API"
  type        = string
  default     = "$default"
}

variable "ignore_dirs" {
  description = "The directories to ignore"
  type        = list(string)
  default     = []
}

variable "ignore_files" {
  description = "The files to ignore"
  type        = list(string)
  default     = []
}

variable "redirect_domain_name" {
  description = "A domain name used to redirect to domain_name"
  type        = string
  default     = null
}

variable "region" {
  description = "The AWS region"
  type        = string
  default     = "us-east-1"
}

# variable "repo" {
#   description = "The repository for the website"
#   type        = string
# }

variable "prod_branch" {
  description = "The production branch for the website"
  type        = string
  default     = "main"
}

variable "subdomain" {
  description = "The subdomain for the website (with trailing dot)"
  type        = string
  default     = ""
}

