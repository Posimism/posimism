output "arn" {
  description = "The ARN of the Lambda function"
  value       = module.function.arn
}

output "invoke_arn" {
  description = "The invoke ARN of the Lambda function"
  value       = module.function.invoke_arn
}

output "name" {
  description = "The function_name of the Lambda function"
  value       = module.function.name
}
