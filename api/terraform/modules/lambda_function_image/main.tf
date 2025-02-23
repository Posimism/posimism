locals {
  tag = "latest"
}

resource "aws_ecr_repository" "default" {
  name                 = var.name
  image_tag_mutability = "MUTABLE"
}

data "aws_region" "current" {}

resource "null_resource" "build_image" {
  triggers = {
    src_dir_hash = sha256(join("", [for f in sort(fileset(var.code_dir, "./**/*")) : filesha256("${var.code_dir}/${f}") if !contains(var.ignore_files, f) && !anytrue([for dir in var.ignore_dirs : strcontains(f, "${dir}/")])]))
  }

  depends_on = [aws_ecr_repository.default]

  provisioner "local-exec" {
    working_dir = var.code_dir
    command     = <<EOT
npm run build:prod &&
docker image tag ${var.image_tag} ${aws_ecr_repository.default.repository_url}:${local.tag} &&
aws ecr get-login-password --region ${data.aws_region.current.name} |
docker login --username AWS --password-stdin ${aws_ecr_repository.default.repository_url} &&
docker push ${aws_ecr_repository.default.repository_url}:${local.tag}
EOT
  }
}

data "aws_ecr_image" "default" {
  repository_name = aws_ecr_repository.default.name
  image_tag       = local.tag
  depends_on      = [null_resource.build_image]
}

resource "aws_lambda_function" "default" {
  function_name = var.name
  architectures = [var.architecture]
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.default.repository_url}:${local.tag}"
  # This shouldn't be necessary, but aws overrides by default
  # So it must be reapplied here
  image_config {
    command = var.CMD
  }
  timeout     = var.timeout
  memory_size = var.memory_size
  description = var.description
  layers      = var.layer_arns

  environment {
    variables = var.environment_variables
  }

  logging_config {
    log_format = "JSON"
    log_group  = aws_cloudwatch_log_group.default.name
  }

  role = aws_iam_role.default.arn

  depends_on = [aws_cloudwatch_log_group.default, aws_iam_role_policy_attachment.default, aws_iam_role_policy_attachment.inputs, null_resource.build_image]

  source_code_hash = trimprefix(data.aws_ecr_image.default.id, "sha256:")
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
