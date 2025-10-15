# API Summary

## User Service
- `POST /api/users/register` – Register CLIENT or SELLER (SELLER avatar optional).
- `POST /api/auth/login` – Authenticate via email/password; returns access + refresh tokens.
- `POST /api/auth/refresh` – Exchange refresh token for a new pair.
- `GET /api/users/me` – Current authenticated profile.
- `PUT /api/users/me` – Update profile (SELLER: avatar allowed via media id).

## Product Service
- `GET /api/products` – Public listing.
- `GET /api/products/{id}` – Product details.
- `GET /api/products/mine` – SELLER scoped list.
- `POST /api/products` – SELLER create.
- `PUT /api/products/{id}` – SELLER update (ownership enforced).
- `DELETE /api/products/{id}` – SELLER delete.

## Media Service
- `POST /api/media/upload` – SELLER upload PNG/JPEG ≤ 2 MB.
- `GET /api/media/{id}/signed-url` – Refresh signed URL for owned media.
- `GET /api/media/view/{id}?token=&expires=` – Public download via signed URL.
- `GET /api/media/internal/validate` – Internal ownership validation (secret header).
- `POST /api/media/internal/verify-batch` – Internal batch validation (secret header).

Swagger UIs are published via the gateway under:
- `/docs/user`, `/docs/product`, `/docs/media` – service-specific documentation.
