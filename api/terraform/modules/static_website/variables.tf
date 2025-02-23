locals {
  sanitized_prefix = replace("${var.subdomain}${var.domain_name}", "/[^a-zA-Z0-9]/", "-")
}

variable "domain_name" {
  description = "value of the domain include tld"
  type        = string
}

variable "subdomain" {
  description = "The subdomain for the website (with trailing dot)"
  type        = string
  default     = ""
}

variable "additional_bucket_statements" {
  description = "Additional policy statements"
  type = list(object({
    sid : string
    effect : string
    principals : list(object({
      type : string
      identifiers : list(string)
    }))
    actions : list(string)
    resources : list(string)
  }))
  default = []
}

variable "cloudfront_distribution_origins" {
  description = "CloudFront distribution origins"
  type = list(object({
    origin_id : string
    domain_name : string
    origin_path : optional(string)
    origin_access_control_id : optional(string)
    connection_attempts : optional(number) # 3, 1-3
    connection_timeout : optional(number) # 10, 1-10
    custom_header : optional(list(object({
      name : string
      value : string
    })))
    origin_shield : optional(object({
      enabled : bool
      origin_shield_region : optional(string)
    }))
    s3_origin_config : optional(object({
      origin_access_identity : string
    }))
    custom_origin_config : optional(object({
      http_port : number
      https_port : number
      origin_protocol_policy : string
      origin_ssl_protocols : list(string)
      origin_read_timeout : optional(number)     # 30, upper limit of 60
      origin_keepalive_timeout : optional(number) # 5, upper limit of 60
    }))
  }))
  default = []
}

variable "cache_policy_readOnly_id" {
  description = "The ID of the cache policy for read-only cache behavior"
  type        = string
}

variable "ordered_cache_behaviors" {
  description = "Ordered cache behavior"
  type = list(object({
    allowed_methods : list(string) # Required
    cached_methods : list(string)  # Required
    cache_policy_id : optional(string)
    compress : optional(bool, false)
    default_ttl : optional(number)
    field_level_encryption_id : optional(string)
    # # deprecated
    # forwarded_values             : object({     # Optional, Deprecated
    #   cookies                    : object({
    #     forward                  : string
    #     whitelisted_names        : list(string)
    #   })
    #   headers                    : list(string)
    #   query_string               : bool
    #   query_string_cache_keys    : list(string)
    # })
    lambda_function_association : optional(list(object({ # Optional, max 4
      event_type : string
      lambda_arn : string
      include_body : bool
    })))
    function_association : optional(list(object({ # Optional, max 2
      event_type : string
      function_arn : string
    })))
    max_ttl : optional(number)
    min_ttl : optional(number, 0)
    origin_request_policy_id : optional(string)
    path_pattern : string # Required
    realtime_log_config_arn : optional(string)
    response_headers_policy_id : optional(string)
    smooth_streaming : optional(bool)
    target_origin_id : string # Required
    trusted_key_groups : optional(list(string))
    trusted_signers : optional(list(string))
    viewer_protocol_policy : string # Required, one of allow-all, https-only, or redirect-to-https
  }))
  default = []
}
