SHELL := /bin/bash

ifneq (,$(wildcard .env))
	include .env
	export
else
	$(error .env file not found! Please create one with your necessary variables.)
endif

deploy:
	@echo "Performing dry run..."
	@aws s3 sync ./out $(BUCKET) --delete --exclude "source/*" --exclude "uploads/*" --dryrun
	@read -p "Do you want to proceed with the sync? (y/n) " ans; \
	if echo $$ans | grep -iq "^y" ; then \
		echo "Syncing files..."; \
		aws s3 sync ./out $(BUCKET) --delete --exclude "source/*" --exclude "uploads/*"; \
		aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*"; \
	else \
		echo "Aborted."; \
	fi
# TODO: remove --delete from sync command in production for bluish/greenish deployment
# TODO: remove the CloudFront invalidation line in production