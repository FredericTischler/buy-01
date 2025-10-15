# Security Controls

## Authentication & Authorization
- Passwords hashed with BCrypt (`BCryptPasswordEncoder`) and never returned by the API.
- JWT access tokens (15 min) and refresh tokens (7 days) signed with shared secret injected via environment variables.
- API Gateway validates JWTs, injects contextual headers (`X-User-Id`, `X-User-Role`) and applies security headers (CSP, XSS, etc.).
- Services re-validate tokens to prevent trust on first use and enforce role guards via Spring Security method annotations.

## Media Handling
- Media uploads restricted to PNG/JPEG and validated with magic number checks.
- 2 MB size limit enforced both client-side (Angular) and server-side.
- Files stored on an isolated volume, never exposed directly.
- Signed URLs (HMAC SHA-256) have 15-minute expiry; internal APIs require a shared secret header.

## Transport Security
- Local deployment exposes HTTPS via Traefik/Nginx instructions (see README). Certificates should be generated per environment (self-signed for dev, Let's Encrypt in prod).

## Secrets Management
- Secrets loaded exclusively from environment variables (`JWT_SECRET`, `MEDIA_SIGNING_SECRET`, `MEDIA_INTERNAL_SECRET`).
- `.env.example` provided; never commit actual secrets.

## Logging & Monitoring
- Log redaction ensures no passwords/refresh tokens leak.
- Actuator health endpoints exposed via gateway on `/actuator/health` for observability.

## Frontend Hardening
- JWT stored in memory + localStorage (for demo); production deployment should switch to secure HttpOnly cookies terminating at the gateway.
- Angular route guards prevent unauthorized navigation; failed API calls trigger logout.

## Validation & Error Handling
- Bean Validation across DTOs with consistent error payloads.
- Centralized `@ControllerAdvice` providing sanitized error messages.
