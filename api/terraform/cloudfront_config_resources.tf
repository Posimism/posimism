data "aws_cloudfront_response_headers_policy" "readOnly" {
  name = "ReadOnly"
}

data "aws_cloudfront_response_headers_policy" "private_readOnly" {
  name = "Private_ReadOnly"
}

data "aws_cloudfront_response_headers_policy" "upload" {
  name = "Upload"
}

data "aws_cloudfront_origin_request_policy" "apigateway" {
  name = "Apigateway"
}

data "aws_cloudfront_cache_policy" "html" {
  name = "HTML"
}

resource "aws_cloudfront_public_key" "default" {
  comment     = "public key default"
  encoded_key = file("${path.module}/env/public_key.pem")
  name        = "${local.sanitized_prefix}-Public_default"
}

resource "aws_cloudfront_key_group" "default" {
  items = [aws_cloudfront_public_key.default.id]
  name  = "${local.sanitized_prefix}-KeyGroup_default"
}

resource "aws_secretsmanager_secret" "cloudfront_private_key" {
  name = "${local.sanitized_prefix}-Cloudfront_private_key"
}

resource "aws_secretsmanager_secret_version" "cloudfront_private_key_version" {
  secret_id     = aws_secretsmanager_secret.cloudfront_private_key.id
  secret_string = file("${path.module}/env/private_key.pem")
}