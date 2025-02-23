.PHONY: dist tidy clean

dist: bootstrap
	@echo "Moving executable to dist directory"
	mkdir -p dist
	mv bootstrap dist

tidy:
	go mod tidy
 
bootstrap: tidy
	@echo "Building Go"
	GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap main 

clean:
	rm -f ./bootstrap