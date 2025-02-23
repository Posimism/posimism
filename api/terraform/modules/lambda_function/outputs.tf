output "arn" {
  description = "The ARN of the Lambda function"
  value       = aws_lambda_function.default.arn
}

output "invoke_arn" {
  description = "The invoke ARN of the Lambda function"
  value       = aws_lambda_function.default.invoke_arn
}

output "name" {
  description = "The function_name of the Lambda function"
  value       = aws_lambda_function.default.function_name
}
