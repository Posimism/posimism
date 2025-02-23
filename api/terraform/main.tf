terraform {
  backend "s3" {}
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50.0"
    }
  }
}

# Define the AWS provider
provider "aws" {
  region = var.region
  # Add other necessary configuration for AWS here.
}

data "aws_caller_identity" "current" {}


locals {
  sanitized_prefix = replace("${var.subdomain}${var.domain_name}", "/[^a-zA-Z0-9]/", "-")

  runtime      = "provided.al2023"
  architecture = "arm64"
}
