locals {
  zip_file_name    = "code.zip"
  all_ignore_files = concat(var.ignore_files, [local.zip_file_name])
}

resource "null_resource" "make" {
  triggers = {
    src_dir_hash = sha256(join("", [for f in sort(fileset(var.code_dir, "./**")) : filesha256("${var.code_dir}/${f}") if !contains(local.all_ignore_files, f) && !anytrue([for dir in var.ignore_dirs : strcontains(f, "${dir}/")])]))
  }

  provisioner "local-exec" {
    command     = "make && make clean"
    working_dir = var.code_dir
  }
}

data "archive_file" "default" {
  type        = "zip"
  source_dir  = "${var.code_dir}/${var.zip_dir}"
  output_path = "${var.code_dir}/${local.zip_file_name}"
  excludes    = ["./.DS_Store"]
  depends_on  = [null_resource.make]
}

resource "aws_lambda_function" "default" {
  function_name    = var.name
  handler          = var.handler
  runtime          = var.runtime
  architectures    = [var.architecture]
  filename         = data.archive_file.default.output_path
  source_code_hash = data.archive_file.default.output_base64sha256
  timeout          = var.timeout
  memory_size      = var.memory_size
  description      = var.description
  layers           = var.layer_arns

  environment {
    variables = var.environment_variables
  }

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.default.name
  }

  role = aws_iam_role.default.arn

  depends_on = [aws_cloudwatch_log_group.default, aws_iam_role_policy_attachment.default, aws_iam_role_policy_attachment.inputs]
}

resource "aws_cloudwatch_log_group" "default" {
  name = "/aws/lambda/${var.name}"

  retention_in_days = var.log_group_retention
}

data "aws_iam_policy_document" "role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "default" {
  name               = "${var.name}-Role"
  assume_role_policy = data.aws_iam_policy_document.role.json
}

resource "aws_iam_role_policy_attachment" "default" {
  role       = aws_iam_role.default.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "inputs" {
  for_each   = { for idx, policy_arn in var.iam_policies : idx => policy_arn }
  role       = aws_iam_role.default.name
  policy_arn = each.value
}
