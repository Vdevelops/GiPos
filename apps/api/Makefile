.PHONY: help run build test clean docker-up docker-down docker-build

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Run the application locally
	go run cmd/api/main.go

build: ## Build the application
	go build -o bin/api cmd/api/main.go

gen: ## Run code generation tools
	@echo "Usage: make gen-tool TOOL=<tool_name>"
	@echo "Available tools: sqlc, migrate, openapi"

gen-sqlc: ## Generate code using sqlc
	go run cmd/gen/main.go sqlc

gen-migrate: ## Create new migration (usage: make gen-migrate NAME=migration_name)
	@if [ -z "$(NAME)" ]; then \
		echo "Usage: make gen-migrate NAME=migration_name"; \
		exit 1; \
	fi
	go run cmd/gen/main.go migrate $(NAME)

seed: ## Run database seeding
	go run cmd/seed/main.go

fix-ids: ## Fix missing IDs in existing database records
	go run cmd/fix-ids/main.go

test: ## Run tests
	go test -v ./...

clean: ## Clean build artifacts
	rm -rf bin/
	go clean

docker-up: ## Start Docker containers
	docker-compose up -d

docker-down: ## Stop Docker containers
	docker-compose down

docker-build: ## Build Docker image
	docker-compose build

docker-logs: ## View Docker logs
	docker-compose logs -f api

install: ## Install dependencies
	go mod download
	go mod tidy

lint: ## Run linter
	golangci-lint run

