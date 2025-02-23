output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = "${local.sanitized_prefix}-${aws_cloudfront_distribution.default.id}"
}

output "s3_bucket_arn" {
  description = "The arn of the S3 bucket"
  value       = aws_s3_bucket.default.arn
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.default.id
}

output "acm_certificate_arn" {
  description = "The ARN of the certificate"
  value       = aws_acm_certificate.default.arn
}
