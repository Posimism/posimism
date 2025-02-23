terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50.0"
    }
  }
}

provider "aws" {
  alias  = "useast1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "default" {
  provider                  = aws.useast1
  domain_name               = "${var.subdomain}${var.domain_name}"
  subject_alternative_names = ["*.${var.subdomain}${var.domain_name}"]
  validation_method         = "DNS"
  key_algorithm             = "EC_prime256v1"
}

data "aws_route53_zone" "default" {
  provider     = aws.useast1
  name         = var.domain_name
  private_zone = false
}

resource "aws_route53_record" "default" {
  provider = aws.useast1
  for_each = {
    for dvo in aws_acm_certificate.default.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      record  = dvo.resource_record_value
      type    = dvo.resource_record_type
      zone_id = data.aws_route53_zone.default.zone_id
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 300
  type            = each.value.type
  zone_id         = each.value.zone_id
}

resource "aws_acm_certificate_validation" "validation" {
  provider                = aws.useast1
  certificate_arn         = aws_acm_certificate.default.arn
  validation_record_fqdns = [for record in aws_route53_record.default : record.fqdn]
}
