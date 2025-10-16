.PHONY: backend-build backend-test frontend-build frontend-test docker-up docker-down format lint ci

backend-build:
	mvn -f backend/pom.xml clean package -DskipTests

backend-test:
	mvn -f backend/pom.xml verify

frontend-install:
	cd frontend/webapp && npm install

frontend-build:
	npm run build --prefix frontend/webapp

frontend-test:
	npm run test --prefix frontend/webapp -- --watch=false

frontend-e2e:
	npm run e2e --prefix frontend/webapp

format:
	mvn -f backend/pom.xml spotless:apply
	npm run lint --prefix frontend/webapp -- --fix

lint:
	mvn -f backend/pom.xml spotless:check
	npm run lint --prefix frontend/webapp

ci:
	mvn -f backend/pom.xml verify
	npm ci --prefix frontend/webapp
	npm run lint --prefix frontend/webapp
	npm run test --prefix frontend/webapp -- --watch=false
	npm run e2e --prefix frontend/webapp
	npm run build --prefix frontend/webapp
	docker compose -f infra/docker-compose.yml build
	docker compose -f infra/docker-compose.yml run --rm api-gateway curl -f http://localhost:8080/actuator/health || true
	docker compose -f infra/docker-compose.yml down

docker-up:
	docker-compose -f infra/docker-compose.yml up -d --build

docker-down:
	docker-compose -f infra/docker-compose.yml down -v
