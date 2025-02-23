resource "aws_cloudfront_distribution" "default" {
  enabled             = true
  is_ipv6_enabled     = false
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = "PriceClass_100"

  aliases = [
    "${var.subdomain}${var.domain_name}",
    "www.${var.subdomain}${var.domain_name}"
  ]

  origin {
    domain_name              = aws_s3_bucket.default.bucket_regional_domain_name
    origin_id                = "s3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
  }

  dynamic "origin" {
    for_each = var.cloudfront_distribution_origins
    content {
      domain_name              = origin.value.domain_name
      origin_id                = origin.value.origin_id
      origin_path              = origin.value.origin_path
      origin_access_control_id = origin.value.origin_access_control_id
      connection_attempts      = origin.value.connection_attempts
      connection_timeout       = origin.value.connection_timeout

      dynamic "custom_header" {
        for_each = origin.value.custom_header != null ? origin.value.custom_header : []
        content {
          name  = custom_header.value.name
          value = custom_header.value.value
        }
      }

      dynamic "origin_shield" {
        for_each = origin.value.origin_shield != null ? [origin.value.origin_shield] : []
        content {
          enabled              = origin_shield.value.enabled
          origin_shield_region = origin_shield.value.origin_shield_region
        }
      }

      dynamic "s3_origin_config" {
        for_each = origin.value.s3_origin_config != null ? [origin.value.s3_origin_config] : []
        content {
          origin_access_identity = s3_origin_config.value.origin_access_identity
        }
      }

      dynamic "custom_origin_config" {
        for_each = origin.value.custom_origin_config != null ? [origin.value.custom_origin_config] : []
        content {
          http_port                = custom_origin_config.value.http_port
          https_port               = custom_origin_config.value.https_port
          origin_protocol_policy   = custom_origin_config.value.origin_protocol_policy
          origin_ssl_protocols     = custom_origin_config.value.origin_ssl_protocols
          origin_read_timeout      = custom_origin_config.value.origin_read_timeout
          origin_keepalive_timeout = custom_origin_config.value.origin_keepalive_timeout
        }
      }
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "s3Origin"
    viewer_protocol_policy = "redirect-to-https"

    # # deprecated
    # forwarded_values {
    #   query_string = false
    #   headers      = ["*"]

    #   cookies {
    #     forward = "none"
    #   }
    # }

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # AWS managed "Managed-CachingOptimized"
    # https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-caching-optimized
    response_headers_policy_id = var.cache_policy_readOnly_id

    compress         = true
    smooth_streaming = false
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.ordered_cache_behaviors
    iterator = behavior
    content {
      allowed_methods            = behavior.value.allowed_methods
      cached_methods             = behavior.value.cached_methods
      cache_policy_id            = behavior.value.cache_policy_id
      compress                   = behavior.value.compress
      default_ttl                = behavior.value.default_ttl
      field_level_encryption_id  = behavior.value.field_level_encryption_id
      path_pattern               = behavior.value.path_pattern
      target_origin_id           = behavior.value.target_origin_id
      viewer_protocol_policy     = behavior.value.viewer_protocol_policy
      smooth_streaming           = behavior.value.smooth_streaming
      realtime_log_config_arn    = behavior.value.realtime_log_config_arn
      response_headers_policy_id = behavior.value.response_headers_policy_id
      origin_request_policy_id   = behavior.value.origin_request_policy_id
      trusted_key_groups         = behavior.value.trusted_key_groups
      trusted_signers            = behavior.value.trusted_signers
      min_ttl                    = behavior.value.min_ttl
      max_ttl                    = behavior.value.max_ttl

      # # deprecated
      # dynamic "forwarded_values" {
      #   for_each = behavior.value.forwarded_values != null ? [behavior.value.forwarded_values] : []
      #   content {
      #     query_string = content.value.query_string
      #     headers      = content.value.headers
      #     cookies {
      #       forward           = content.value.cookies.forward
      #       whitelisted_names = content.value.cookies.whitelisted_names
      #     }
      #     query_string_cache_keys = content.value.query_string_cache_keys
      #   }
      # }

      dynamic "lambda_function_association" {
        for_each = behavior.value.lambda_function_association != null ? behavior.value.lambda_function_association : []
        iterator = association
        content {
          event_type   = association.value.event_type
          lambda_arn   = association.value.lambda_arn
          include_body = association.value.include_body
        }
      }

      dynamic "function_association" {
        for_each = behavior.value.function_association != null ? behavior.value.function_association : []
        iterator = association
        content {
          event_type   = association.value.event_type
          function_arn = association.value.function_arn
        }
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.default.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
  }

  custom_error_response {
    error_caching_min_ttl = 0
    error_code            = 403
    response_code         = 403
    response_page_path    = "/404.html"
  }
}

resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "${local.sanitized_prefix}-OAC_default"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_route53_record" "cloudfront" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = "${var.subdomain}${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.default.domain_name
    zone_id                = aws_cloudfront_distribution.default.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "cloudfront_ipv6" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = "${var.subdomain}${var.domain_name}"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.default.domain_name
    zone_id                = aws_cloudfront_distribution.default.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_cloudfront" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = "www.${var.subdomain}${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.default.domain_name
    zone_id                = aws_cloudfront_distribution.default.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_cloudfront_ipv6" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = "www.${var.subdomain}${var.domain_name}"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.default.domain_name
    zone_id                = aws_cloudfront_distribution.default.hosted_zone_id
    evaluate_target_health = false
  }
}
