.PHONY: *

export STAGE ?= default
VAR_FILE := -var-file=env/${STAGE}.tfvars
S3_BACKEND_FILE := env/${STAGE}.s3.tfbackend
S3_STATE_KEY := posimism-${STAGE}_root.tfstate

apply:
	terraform apply ${VAR_FILE}

init:
	terraform init -upgrade

init-s3:
	terraform init -backend-config=${S3_BACKEND_FILE} -backend-config="key=${S3_STATE_KEY}"

refresh:
	terraform refresh ${VAR_FILE}

destroy:
	terraform destroy ${VAR_FILE}