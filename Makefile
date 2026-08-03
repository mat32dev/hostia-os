.PHONY: dev build up down logs clean test lint

# Development
dev: up

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

# Individual services
pos:
	docker compose up pos-api postgres redis

guard:
	docker compose up guard-api guard-worker postgres redis minio

chat:
	docker compose up chat-api pos-api guard-api

hub:
	docker compose up hub pos-api guard-api chat-api

# Testing
test:
	docker compose exec pos-api pytest tests/ -v
	docker compose exec guard-api pytest tests/ -v

# Linting
lint:
	docker compose exec pos-api ruff check src/
	docker compose exec guard-api ruff check src/

# Cleanup
clean:
	docker compose down -v
	docker system prune -f

# Database
db-migrate:
	docker compose exec pos-api alembic upgrade head

db-reset:
	docker compose exec postgres psql -U hostia -d hostia_os -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	docker compose exec pos-api alembic upgrade head

# Build production images
build-prod:
	docker compose -f docker-compose.prod.yml build

# Edge device
edge:
	docker compose --profile edge up edge
