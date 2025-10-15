# Buy01 – Microservices E-commerce Platform

[![CI](https://github.com/your-org/buy-01/actions/workflows/ci.yml/badge.svg?branch=main&label=CI)](https://github.com/your-org/buy-01/actions/workflows/ci.yml)
[![Backend Tests](https://github.com/your-org/buy-01/actions/workflows/ci.yml/badge.svg?branch=main&label=Backend%20Tests)](https://github.com/your-org/buy-01/actions/workflows/ci.yml)
[![Frontend Lint](https://github.com/your-org/buy-01/actions/workflows/ci.yml/badge.svg?branch=main&label=Frontend%20Lint)](https://github.com/your-org/buy-01/actions/workflows/ci.yml)

Buy01 is an end-to-end microservices marketplace featuring Spring Boot services, an Angular 17 SPA, secure media handling, and complete Docker-based orchestration.

## Monorepo Layout

```
backend/                Spring Boot microservices (Eureka, Gateway, User, Product, Media)
frontend/webapp/        Angular 17 single page application served by Nginx
infra/                  Docker Compose, Nginx config, Postman collection
scripts/                DX helpers (Newman runner, Make targets)
docs/                   Architecture & security documentation
```

## Features
- JWT authentication (access + refresh tokens), RBAC (CLIENT / SELLER).
- Seller dashboards for product CRUD and media management.
- Media uploads restricted to PNG/JPEG ≤ 2 MB with magic-number validation and signed URLs.
- Discovery + Gateway architecture with per-service MongoDB databases.
- Swagger/OpenAPI for every service, Postman collection, and Playwright E2E tests.
- Robust CI pipeline (lint, tests, Docker build) and reproducible Docker Compose stack.

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 20+
- Docker & Docker Compose

### Bootstrap
```bash
cp .env.example .env
make backend-build
npm install --prefix frontend/webapp
```

### Run Everything (HTTPS-ready)
```bash
docker compose --env-file .env -f infra/docker-compose.yml up -d --build
```
Services:
- Frontend: https://localhost:4200
- API Gateway: https://localhost:8080 (proxy via Nginx; configure TLS per docs)
- Swagger: https://localhost:8080/docs/user (and `/product`, `/media`)
- Eureka Dashboard: http://localhost:8761

Stop the stack:
```bash
make docker-down
```

### Manual Flow (Local)
1. Register a seller via Postman or the Sign-Up page (upload avatar required).
2. Log in, open the dashboard, upload product images (≤ 2 MB).
3. Create products; they appear on the public catalogue instantly.
4. Revisit the `/media` page to manage signed URLs when needed.

## Testing & Quality

```bash
make backend-test         # JUnit + Spring Boot Testcontainers
npm run lint --prefix frontend/webapp
npm run test --prefix frontend/webapp -- --watch=false
npm run e2e --prefix frontend/webapp
scripts/run-newman.sh     # API regression with Newman
```

CI (`.github/workflows/ci.yml`) executes all the above plus Docker builds on pushes/PRs.

## Security Highlights
- BCrypt-hashed passwords, zero exposure in responses.
- Gateway-level security headers and JWT validation; downstream re-validation + RBAC.
- Media service enforces MIME + signature checks, 2 MB limit, signed URL access (HMAC SHA-256).
- Secrets supplied via environment variables (`JWT_SECRET`, `MEDIA_SIGNING_SECRET`, `MEDIA_INTERNAL_SECRET`).
- HTTPS guidance for self-signed dev certs and Let's Encrypt production setup (`docs/DEPLOYMENT.md`).

## Documentation
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API.md`](docs/API.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)

## Tooling Cheatsheet
- `make format` – Spotless + ESLint fixes.
- `scripts/run-newman.sh` – Runs the Postman collection (requires Newman CLI).
- Playwright config: `frontend/webapp/playwright.config.ts`.

## Next Steps
- Swap local storage for MinIO/S3 by replacing the `StorageService` implementation.
- Harden token storage using secure HttpOnly cookies issued at the gateway.
- Extend analytics (Kafka hooks scaffolded) to track product lifecycle events.

Happy hacking! 🚀
