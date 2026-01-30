.PHONY: help docker-up docker-down docker-logs docker-build docker-restart docker-clean docker-dev docker-prod docker-test docker-health

help:
	@echo "Home Finance - Docker Commands"
	@echo ""
	@echo "Development (with MariaDB in Docker):"
	@echo "  make docker-dev          Start development environment"
	@echo "  make docker-logs         Show logs"
	@echo ""
	@echo "Production (without DB):"
	@echo "  make docker-prod         Start production environment"
	@echo ""
	@echo "General:"
	@echo "  make docker-up           Start all services"
	@echo "  make docker-down         Stop all services"
	@echo "  make docker-restart      Restart services"
	@echo "  make docker-build        Build images"
	@echo "  make docker-clean        Clean everything"
	@echo "  make docker-health       Check health"
	@echo "  make docker-test         Run tests"

# Development environment (with MariaDB)
docker-dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✓ Services started!"
	@echo "  Frontend: http://localhost:3001"
	@echo "  Backend:  http://localhost:3000"
	@echo "  Database: localhost:3306"

# Production environment (without DB)
docker-prod:
	@echo "Starting production environment..."
	docker-compose up -d
	@echo ""
	@echo "✓ Services started!"
	@echo "  Frontend: http://localhost:3001"
	@echo "  Backend:  http://localhost:3000"

# Start services (default docker-compose.yml)
docker-up:
	docker-compose up -d
	@echo "✓ Services started"

# Stop services
docker-down:
	docker-compose down
	@echo "✓ Services stopped"

# Stop dev services
docker-down-dev:
	docker-compose -f docker-compose.dev.yml down
	@echo "✓ Dev services stopped"

# View logs
docker-logs:
	docker-compose logs -f

# View dev logs
docker-logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-logs-backend:
	docker-compose logs -f backend

docker-logs-frontend:
	docker-compose logs -f frontend

docker-logs-db:
	docker-compose -f docker-compose.dev.yml logs -f db

# Build images
docker-build:
	docker-compose build

docker-build-dev:
	docker-compose -f docker-compose.dev.yml build

docker-build-no-cache:
	docker-compose build --no-cache

docker-build-dev-no-cache:
	docker-compose -f docker-compose.dev.yml build --no-cache

# Restart services
docker-restart:
	docker-compose restart

docker-restart-dev:
	docker-compose -f docker-compose.dev.yml restart

# Clean everything
docker-clean:
	docker-compose down -v
	@echo "✓ Cleaned (volumes removed)"

docker-clean-dev:
	docker-compose -f docker-compose.dev.yml down -v
	@echo "✓ Dev cleaned (volumes removed)"

docker-clean-all:
	docker-compose down -v
	docker image prune -af
	@echo "✓ Everything cleaned"

# Health checks
docker-health:
	@echo "Checking services health..."
	docker-compose ps
	@echo ""
	@echo "Checking backend health..."
	curl -s http://localhost:3000/health | jq . || echo "Backend not responding"

docker-health-dev:
	@echo "Checking dev services health..."
	docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "Checking backend health..."
	curl -s http://localhost:3000/health | jq . || echo "Backend not responding"

# Rebuild and restart
docker-rebuild:
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✓ Rebuilt and restarted"

docker-rebuild-dev:
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.dev.yml build --no-cache
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✓ Dev rebuilt and restarted"

# Execute commands in containers
shell-backend:
	docker-compose exec backend /bin/sh

shell-frontend:
	docker-compose exec frontend /bin/sh

shell-db:
	docker-compose -f docker-compose.dev.yml exec db mariadb -u root -p

# Run seed
seed:
	docker-compose -f docker-compose.dev.yml exec backend npm run seed

# Test
docker-test:
	@echo "Running tests..."
	docker-compose -f docker-compose.dev.yml exec backend npm test

# Show docker images
images:
	docker images | grep home_finance

# Show docker containers
ps:
	docker-compose ps

ps-dev:
	docker-compose -f docker-compose.dev.yml ps

# Git helpers
git-add-docker:
	git add Dockerfile backend/Dockerfile docker-compose.yml docker-compose.dev.yml .dockerignore .env.docker DOCKER_SETUP.md DOCKER_CHECKLIST.md render.yaml .github/workflows/docker-build.yml

git-commit-docker:
	git commit -m "feat: add docker configuration for development and production"

git-push-docker:
	git push origin main

# Development workflow
dev-start: docker-dev docker-logs-dev

dev-stop: docker-down-dev

dev-restart: docker-rebuild-dev

dev-logs: docker-logs-dev

# Production workflow
prod-start: docker-prod docker-logs

prod-stop: docker-down

prod-restart: docker-rebuild
