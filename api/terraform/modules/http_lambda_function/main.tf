locals {
  sanitized_route = replace(var.route, "/[^a-zA-Z0-9]/", "")
}

module "function" {
  source = "./../lambda_function"

  name                  = "${var.api_id}-${local.sanitized_route}-${var.method}"
  runtime               = var.runtime
  architecture          = var.architecture
  handler               = "handler.handler"
  timeout               = var.timeout
  memory_size           = var.memory_size
  environment_variables = var.environment_variables
  iam_policies          = var.iam_policies
  description           = var.description
  layer_arns            = var.layer_arns

  code_dir = var.code_dir
  zip_dir  = var.zip_dir
}

module "http_integration" {
  source = "./../http_lambda_integration"

  api_arn                    = var.api_arn
  api_id                     = var.api_id
  route                      = var.route
  method                     = var.method
  lambda_function_invoke_arn = module.function.invoke_arn
  lambda_function_arn        = module.function.arn
  lambda_function_name       = module.function.name


  authorizer_id        = var.authorizer_id
  authorizer_type      = var.authorizer_type
  authorization_scopes = var.authorization_scopes

  depends_on = [module.function]
}
