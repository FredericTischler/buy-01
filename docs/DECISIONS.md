# Key Technical Decisions

1. **Spring Cloud stack** – Eureka + Gateway ensures dynamic routing and JWT propagation across services.
2. **MongoDB per service** – Simplifies domain isolation and supports flexible document models for products/media metadata.
3. **Local filesystem storage** – Meets requirement (MinIO optional); packaged with signed URL system for secure image delivery.
4. **JWT-based RBAC** – Gateway validates and injects role headers; services still enforce role checks to avoid TOCTOU issues.
5. **Angular 17 standalone components** – Lightweight module-less structure suitable for domain-driven pages with route guards and interceptors.
6. **Testcontainers** – Mongo integration tests run against disposable containers ensuring high-fidelity testing without mocks.
7. **Playwright E2E** – Covers UX paths and integrates into CI for regression detection.
8. **Docker Compose orchestration** – Enables local end-to-end execution with HTTPS guidance documented for production readiness.
