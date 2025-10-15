# Deployment & HTTPS

## Local HTTPS
1. Generate a self-signed certificate (example using mkcert):
   ```bash
   mkcert -key-file infra/tls/local-key.pem -cert-file infra/tls/local-cert.pem localhost 127.0.0.1
   ```
2. Update `infra/docker-compose.yml` to mount the certificate into the gateway or an edge proxy (e.g., Traefik) and terminate TLS there.
3. Adjust the Angular `environment.ts` `apiUrl` to `https://localhost` (already default).

## Production HTTPS with Let's Encrypt
- Deploy a reverse proxy (Traefik, Nginx, Caddy) in front of the stack.
- Configure automatic certificate requests via Let's Encrypt using HTTP-01 challenge.
- Forward traffic to the API gateway on port `8080`; serve the Angular build through the same proxy.
- Set HSTS headers (`Strict-Transport-Security`) and redirect HTTP → HTTPS.

## Container Images
- Build images with `docker compose -f infra/docker-compose.yml build`.
- Push to your registry (e.g., GHCR). Example:
  ```bash
  docker tag buy01-api-gateway ghcr.io/your-org/buy01-api-gateway:latest
  docker push ghcr.io/your-org/buy01-api-gateway:latest
  ```
- Use `docker compose pull` on servers.

## Database & Storage
- Each service has an independent MongoDB instance. For production, use managed replicas or configure Mongo Atlas/DocumentDB.
- Bind `media-storage` to persistent cloud storage (S3/MinIO) if high durability is required. The service can be adapted by replacing the filesystem implementation with S3-compatible SDK.
