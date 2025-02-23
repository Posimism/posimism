# resource "aws_amplify_app" "website" {
#   name                          = var.domain_name
#   repository                    = var.repo
#   access_token                  = var.access_token
#   enable_auto_branch_creation   = true
#   enable_branch_auto_build      = true
#   enable_branch_auto_deletion   = true
#   auto_branch_creation_patterns = ["auto-*"]
#   platform                      = "WEB_COMPUTE"
#   auto_branch_creation_config {
#     enable_auto_build    = true
#     stage                  = "DEVELOPMENT"
#     enable_basic_auth      = true
#     basic_auth_credentials = base64encode(var.basic_auth_credentials)
#     framework              = "Next.js -SSR"
#   }
#   build_spec = <<-EOF
#     version: 1
#     applications:
#       - frontend:
#           phases:
#             preBuild:
#               commands:
#                 - npm ci --cache .npm --prefer-offline
#             build:
#               commands:
#                 - npm run build
#           artifacts:
#             baseDirectory: .next
#             files:
#               - '**/*'
#           cache:
#             paths:
#               - .next/cache/**/*
#               - .npm/**/*
#         appRoot: thomas-w
#   EOF

#   custom_rule {
#     source = "/<*>"
#     target = "/index.html"
#     status = "404"
#   }

#   environment_variables = {
#     AMPLIFY_MONOREPO_APP_ROOT = "/thomas-w"
#     AMPLIFY_DIFF_DEPLOY       = "false"
#   }
# }

# resource "aws_amplify_branch" "prod" {
#   app_id                      = aws_amplify_app.website.id
#   branch_name                 = var.prod_branch
#   enable_auto_build           = true
#   enable_pull_request_preview = true
#   stage                       = "PRODUCTION"
#   # must be duplicated on each branch
#   environment_variables = {
#     AMPLIFY_MONOREPO_APP_ROOT = "/thomas-w"
#     AMPLIFY_DIFF_DEPLOY       = "false"
#   }
# }

resource "aws_amplify_app" "website" {
  name     = var.domain_name
  platform = "WEB"

  # custom_rule {
  #   source = "/api/<*>"
  #   target = "https://${aws_apigatewayv2_domain_name.default.domain_name}/<*>"
  #   status = 200
  # }

  custom_rule {
    source = "www.${var.domain_name}/<*>"
    target = "https://${var.domain_name}/<*>"
    status = "301"
  }

  custom_rule {
    source = "/<*>"
    target = "/index.html"
    status = "404"
  }
}

resource "aws_amplify_branch" "prod" {
  app_id      = aws_amplify_app.website.id
  branch_name = var.prod_branch
  stage       = "PRODUCTION"
}

resource "aws_s3_bucket" "static_website" {
  bucket = "${var.domain_name}-static-website"
}

resource "aws_s3_bucket_public_access_block" "static_website" {
  bucket = aws_s3_bucket.static_website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "website_bucket_server_side_encryption_configuration" {
  bucket = aws_s3_bucket.static_website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "website_bucket_versioning" {
  bucket = aws_s3_bucket.static_website.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "website_bucket_lifecycle_configuration" {
  bucket = aws_s3_bucket.static_website.id

  rule {
    id     = "Remove-Deleted"
    status = "Enabled"
    noncurrent_version_expiration {
      noncurrent_days = 1
    }
  }
}

data "aws_iam_policy_document" "static_website_bucket_policy" {
  version = "2008-10-17"

  statement {
    sid    = "AllowAmplifyToListPrefix_appid_branch_prefix_"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }

    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.static_website.arn]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["${urlencode(aws_amplify_app.website.arn)}%2Fbranches%2F${aws_amplify_branch.prod.branch_name}"]
    }

    condition {
      test     = "StringEquals"
      variable = "s3:prefix"
      values   = [""]
    }
  }

  statement {
    sid    = "AllowAmplifyToReadPrefix__appid_branch_prefix_"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["amplify.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.static_website.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["${urlencode(aws_amplify_app.website.arn)}%2Fbranches%2F${aws_amplify_branch.prod.branch_name}"]
    }
  }

  statement {
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["s3:*"]
    resources = ["${aws_s3_bucket.static_website.arn}/*"]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "static_website_bucket_policy" {
  bucket = aws_s3_bucket.static_website.id
  policy = data.aws_iam_policy_document.static_website_bucket_policy.json
}

resource "null_resource" "deploy" {
  triggers = {
    src_dir_hash = sha256(join("", [for f in sort(fileset(var.build_dir, "./**/*")) : filesha256("${var.build_dir}/${f}") if !contains(var.ignore_files, f) && !anytrue([for dir in var.ignore_dirs : strcontains(f, "${dir}/")])]))
  }

  depends_on = [aws_s3_bucket.static_website, aws_amplify_branch.prod, aws_s3_bucket_policy.static_website_bucket_policy]

  provisioner "local-exec" {
    command = "aws s3 sync --size-only ${var.build_dir} s3://${aws_s3_bucket.static_website.id} && aws amplify start-deployment --app-id ${aws_amplify_app.website.id} --branch-name ${aws_amplify_branch.prod.branch_name} --source-url s3://${aws_s3_bucket.static_website.id} --source-url-type BUCKET_PREFIX"
  }

}

resource "aws_amplify_domain_association" "website" {
  domain_name = var.domain_name
  app_id      = aws_amplify_app.website.id

  sub_domain {
    branch_name = aws_amplify_branch.prod.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.prod.branch_name
    prefix      = "www"
  }
}

resource "aws_amplify_app" "redirect_website" {
  name     = var.redirect_domain_name
  platform = "WEB"

  custom_rule {
    source = "<*>"
    target = "https://${var.domain_name}/<*>"
    status = "301"
  }
}

resource "aws_acm_certificate" "redirect_website" {
  domain_name               = var.redirect_domain_name
  subject_alternative_names = ["*.${var.redirect_domain_name}"]
  validation_method         = "DNS"
}

resource "aws_amplify_branch" "redirect_prod" {
  app_id      = aws_amplify_app.redirect_website.id
  branch_name = var.prod_branch
  stage       = "PRODUCTION"
}

resource "aws_amplify_domain_association" "redirect_website" {
  domain_name = var.redirect_domain_name
  app_id      = aws_amplify_app.redirect_website.id

  sub_domain {
    branch_name = aws_amplify_branch.redirect_prod.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.redirect_prod.branch_name
    prefix      = "www"
  }
}
