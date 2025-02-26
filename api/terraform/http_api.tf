# resource "aws_apigatewayv2_api" "default" {
#   name          = "${local.sanitized_prefix}-api"
#   protocol_type = "HTTP"
#   cors_configuration {
#     allow_credentials = true
#     allow_headers     = ["Content-Type", "Authorization"]
#     allow_methods     = ["GET", "PUT", "PUT", "DELETE", "OPTIONS", "PATCH"]
#     allow_origins     = ["http://localhost:3000", "https://${var.subdomain}${var.domain_name}"]
#     # max_age = 3600 # 1 hour in production
#   }
#   disable_execute_api_endpoint = true
# }

# resource "aws_apigatewayv2_stage" "default" {
#   api_id      = aws_apigatewayv2_api.default.id
#   name        = var.http_api_stage
#   auto_deploy = true

#   access_log_settings {
#     destination_arn = aws_cloudwatch_log_group.api.arn

#     format = jsonencode({
#       requestId               = "$context.requestId"
#       sourceIp                = "$context.identity.sourceIp"
#       requestTime             = "$context.requestTime"
#       protocol                = "$context.protocol"
#       httpMethod              = "$context.httpMethod"
#       resourcePath            = "$context.resourcePath"
#       routeKey                = "$context.routeKey"
#       status                  = "$context.status"
#       responseLength          = "$context.responseLength"
#       integrationErrorMessage = "$context.integrationErrorMessage"
#       }
#     )
#   }
# }

# resource "aws_cloudwatch_log_group" "api" {
#   name              = "/aws/api-gateway/${local.sanitized_prefix}"
#   retention_in_days = 30
# }

# resource "aws_acm_certificate" "default_regional" {
#   domain_name               = "${var.subdomain}${var.domain_name}"
#   subject_alternative_names = ["*.${var.subdomain}${var.domain_name}"]
#   validation_method         = "DNS"
#   key_algorithm             = "EC_prime256v1"
# }

# data "aws_route53_zone" "default" {
#   name         = var.domain_name
#   private_zone = false
# }

# resource "aws_route53_record" "default_regional" {
#   for_each = {
#     for dvo in aws_acm_certificate.default_regional.domain_validation_options : dvo.domain_name => {
#       name    = dvo.resource_record_name
#       record  = dvo.resource_record_value
#       type    = dvo.resource_record_type
#       zone_id = data.aws_route53_zone.default.zone_id
#     }
#   }

#   allow_overwrite = true
#   name            = each.value.name
#   records         = [each.value.record]
#   ttl             = 300
#   type            = each.value.type
#   zone_id         = each.value.zone_id
# }

# resource "aws_acm_certificate_validation" "default_regional" {
#   certificate_arn         = aws_acm_certificate.default_regional.arn
#   validation_record_fqdns = [for record in aws_route53_record.default_regional : record.fqdn]
# }

# resource "aws_apigatewayv2_domain_name" "default" {
#   domain_name = "${var.http_api_prefix}.${var.subdomain}${var.domain_name}"
#   domain_name_configuration {
#     endpoint_type = "REGIONAL"
#     # certificate_arn = module.default_website.acm_certificate_arn
#     certificate_arn = aws_acm_certificate.default_regional.arn # must be same region as gateway
#     security_policy = "TLS_1_2"
#   }
#   depends_on = [aws_acm_certificate_validation.default_regional]
# }

# resource "aws_apigatewayv2_api_mapping" "default" {
#   api_id          = aws_apigatewayv2_api.default.id
#   domain_name     = aws_apigatewayv2_domain_name.default.domain_name
#   stage           = var.http_api_stage
#   api_mapping_key = var.http_api_domain_mapping_key

#   depends_on = [aws_apigatewayv2_stage.default]
# }

# resource "aws_apigatewayv2_api_mapping" "cloudfront" {
#   api_id          = aws_apigatewayv2_api.default.id
#   domain_name     = aws_apigatewayv2_domain_name.default.domain_name
#   stage           = var.http_api_stage
#   api_mapping_key = "${var.http_api_prefix}${var.http_api_domain_mapping_key}" # Must be same as cache behav. path

#   depends_on = [aws_apigatewayv2_stage.default]
# }

# resource "aws_route53_record" "http_api" {
#   zone_id = data.aws_route53_zone.default.zone_id
#   name    = "${var.http_api_prefix}.${var.subdomain}${var.domain_name}"
#   type    = "A"

#   alias {
#     name                   = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].target_domain_name
#     zone_id                = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# resource "aws_route53_record" "http_api_ipv6" {
#   zone_id = data.aws_route53_zone.default.zone_id
#   name    = "${var.http_api_prefix}.${var.subdomain}${var.domain_name}"
#   type    = "AAAA"

#   alias {
#     name                   = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].target_domain_name
#     zone_id                = aws_apigatewayv2_domain_name.default.domain_name_configuration[0].hosted_zone_id
#     evaluate_target_health = false
#   }
# }

# module "http_api_test_GET" {
#   source      = "./modules/http_lambda_function"
#   description = "Test endpoint for the HTTP API"

#   api_arn      = aws_apigatewayv2_api.default.arn
#   api_id       = aws_apigatewayv2_api.default.id
#   architecture = local.architecture
#   runtime      = local.runtime
#   memory_size  = 128
#   timeout      = 2

#   handler  = "handler.handler"
#   method   = "GET"
#   route    = "/test"
#   code_dir = "${path.root}/../src/test/GET"
# }
