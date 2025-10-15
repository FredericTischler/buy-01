# Buy01 – Plateforme e-commerce microservices

Buy01 est une marketplace complète bâtie sur un ensemble de microservices Spring Boot, une SPA Angular 17 et une orchestration Docker prête pour la prod. Cette version du README rassemble l’architecture, les parcours fonctionnels et toutes les commandes utiles pour exécuter, tester et déployer le projet.

## Aperçu rapide
- Frontend Angular servi via Nginx, consommant une API Gateway sécurisée.
- Quatre services Spring Boot : découverte (Eureka), gateway, utilisateurs, produits, médias.
- Sécurité par JWT (access + refresh), rôles `CLIENT` et `SELLER`, validations serveur/cliente.
- Stockage MongoDB par service, volume isolé pour les médias, signatures HMAC pour les URLs publiques.
- CI/CD (lint, tests, build, images) et documentation technique dans `docs/`.

## Architecture des services

| Service | Port | Description | Stack principale |
|---------|------|-------------|------------------|
| Discovery Service | 8761 | Serveur Eureka pour l’enregistrement des services | Spring Cloud Netflix, Actuator |
| API Gateway | 8080 | Valide les JWT, applique les headers de sécurité, route vers les services, expose Swagger | Spring Cloud Gateway, Spring Security reactive |
| User Service | 8081 | Authentification, gestion des profils, refresh tokens, intégration média | Spring Boot, MongoDB, WebClient |
| Product Service | 8082 | CRUD produits, cache catalogue, validation ownership média | Spring Boot, MongoDB, Cache simple |
| Media Service | 8083 | Upload PNG/JPEG ≤ 2 Mo, stockage local, URLs signées, API internes sécurisées | Spring Boot, MongoDB, stockage fichiers |
| Webapp | 4200 (Nginx) | SPA Angular (catalogue public, dashboard vendeur, gestion médias) | Angular 17, JWT interceptor |

> Diagrammes détaillés et décisions d’architecture : `docs/ARCHITECTURE.md` & `docs/DECISIONS.md`.

## Fonctionnement de l’application

### Parcours utilisateur (CLIENT)
1. Consultation publique du catalogue via `/api/products` (aucun token requis).
2. Création de compte client (`POST /api/users/register`).
3. Authentification (`POST /api/auth/login`) renvoyant access + refresh tokens.
4. Consommation des APIs authentifiées (profil `/api/users/me`, rafraîchissement token `/api/auth/refresh`).

### Parcours vendeur (SELLER)
1. Inscription vendeur avec avatar obligatoire (validation ownership dans le Media Service).
2. Dashboard Angular sécurisé (route guard) accédant aux endpoints `/api/products/mine`.
3. Upload d’images (`/api/media/upload`) → génération d’URL signée.
4. Création/édition de produits (`POST/PUT /api/products`) avec association des médias validés.
5. Suppression produits (`DELETE /api/products/{id}`) déclenchant logs d’événements (hook Kafka prêt).

### Flux internes
- La Gateway décode le JWT, renseigne les headers (`X-User-Id`, `X-User-Role`) et rejette toute requête non autorisée.
- Les services `user`, `product`, `media` revalident le token et appliquent leur logique métier/ownership.
- Les APIs `/docs/*` publient les Swagger UIs de chaque service.
- Les appels internes au Media Service exigent le header `X-Service-Secret` (`MEDIA_INTERNAL_SECRET`).

## Structure du dépôt

```
backend/                Modules Maven (Eureka, Gateway, User, Product, Media)
frontend/webapp/        Application Angular 17 + Playwright/Karma
infra/                  Docker Compose, config Nginx, collection Postman
docs/                   Architecture, API, sécurité, déploiement
scripts/                Scripts utilitaires (Newman)
Makefile                Cibles build/test, wrappers Docker
```

## Pré-requis
- Java 21+ & Maven 3.9+
- Node.js 20+ & npm
- Docker 24+ & Docker Compose v2
- mkcert (optionnel) pour HTTPS local, Newman pour les tests Postman

## Initialisation

```bash
cp .env.example .env   # Définir vos secrets avant toute montée de stack
make backend-build     # Package des 5 microservices (skip tests)
npm install --prefix frontend/webapp
```

## Exécution avec Docker Compose

### Démarrage standard

```bash
docker compose --env-file .env -f infra/docker-compose.yml up -d --build
```

Services accessibles :
- Frontend : http://localhost:4200 (nginx → Angular dist)
- API Gateway : http://localhost:8080
- Swagger : http://localhost:8080/docs/{user|product|media}
- Eureka : http://localhost:8761

### Commandes Docker utiles

Toutes les commandes se basent sur `infra/docker-compose.yml` :

```bash
# Démarrage (premier plan / arrière-plan)
docker compose -f infra/docker-compose.yml up
docker compose -f infra/docker-compose.yml up -d

# Arrêt et nettoyage
docker compose -f infra/docker-compose.yml stop
docker compose -f infra/docker-compose.yml down
docker compose -f infra/docker-compose.yml down -v      # supprime aussi les volumes Mongo/médias

# Build & mise à jour d’images
docker compose -f infra/docker-compose.yml build
docker compose -f infra/docker-compose.yml build api-gateway
docker compose -f infra/docker-compose.yml pull         # récupère les images distantes si disponibles

# Observation
docker compose -f infra/docker-compose.yml ps
docker compose -f infra/docker-compose.yml logs -f
docker compose -f infra/docker-compose.yml logs -f product-service

# Maintenance ciblée
docker compose -f infra/docker-compose.yml restart media-service
docker compose -f infra/docker-compose.yml exec user-service sh
docker compose -f infra/docker-compose.yml run --rm api-gateway curl -f http://localhost:8080/actuator/health
docker compose -f infra/docker-compose.yml rm           # supprime les conteneurs arrêtés
```

Raccourcis Makefile :
- `make docker-up` ⇒ `docker compose ... up -d --build`
- `make docker-down` ⇒ `docker compose ... down -v`

### Volumes & réseau
- `user-mongo-data`, `product-mongo-data`, `media-mongo-data` : bases Mongo persistées.
- `media-storage` : fichiers stockés par le Media Service.
- Réseau `buy01-net` : communication interne (Gateway ↔ services ↔ Mongo).

## Développement sans Docker

### Backend
```bash
# Lancer uniquement le service utilisateurs (config par défaut)
mvn -f backend/pom.xml -pl user-service spring-boot:run

# Exemple en surchargeant la connexion Mongo locale
MONGODB_URI=mongodb://localhost:27017/userdb \
JWT_SECRET=change-me \
mvn -f backend/pom.xml -pl user-service spring-boot:run

# Tous les services peuvent être exécutés ainsi (adapter port + variables)
mvn -f backend/pom.xml -pl discovery-service spring-boot:run
mvn -f backend/pom.xml -pl api-gateway spring-boot:run
mvn -f backend/pom.xml -pl product-service spring-boot:run
mvn -f backend/pom.xml -pl media-service spring-boot:run
```

### Frontend
```bash
npm install --prefix frontend/webapp
npm start --prefix frontend/webapp    # http://localhost:4200, proxy /api → gateway (config Web)
npm run build --prefix frontend/webapp
```

## Tests & Qualité

```bash
make backend-test                         # Maven verify (tests + Spotless check)
make frontend-test                        # npm test (Karma/Jasmine)
make frontend-e2e                         # Playwright
make lint                                 # Spotless + ESLint
scripts/run-newman.sh infra/postman/buy01-collection.json
```

CI (`.github/workflows/ci.yml`) enchaîne build, tests, lint, e2e, build Docker et vérification de santé.

## Variables d’environnement clés

| Variable | Description | Valeur par défaut (`.env.example`) |
|----------|-------------|-------------------------------------|
| `JWT_SECRET` | Secret de signature des JWT (gateway + services) | `changeit-changeit-changeit-changeit-changeit` |
| `MEDIA_SIGNING_SECRET` | HMAC pour les URLs signées du Media Service | `media-signing-secret-change-me-please` |
| `MEDIA_INTERNAL_SECRET` | Secret partagé pour les endpoints internes média | `internal-service-secret-change-me` |
| `ACCESS_TOKEN_TTL` | Durée de vie access token (sec, User Service) | `900` |
| `REFRESH_TOKEN_TTL` | Durée de vie refresh token (sec, User Service) | `604800` |
| `MONGODB_URI` | Surchage possible par service pour Mongo | selon service |
| `MEDIA_STORAGE_PATH` | Volume de stockage fichiers média | `/app/media-storage` |

> Ajouter `.env` au `.gitignore` (déjà fait) et ne jamais committer de secrets réels.

## Données & stockage
- Chaque service possède sa collection Mongo isolée (schema libre, migrations gérées par Spring Data).
- Les médias sont stockés sur disque (checksum SHA-256, nommage `sellerId/UUID.ext`).
- Remplacer le stockage local par MinIO/S3 ⇒ modifier `StorageService`.

## Observabilité & documentation
- Actuator health : `http://localhost:8080/actuator/health` (via Gateway).
- Swagger UIs : `http://localhost:8080/docs/{user|product|media}`.
- Postman : `infra/postman/buy01-collection.json` (script `scripts/run-newman.sh`).
- Docs supplémentaires : `docs/API.md`, `docs/SECURITY.md`, `docs/DEPLOYMENT.md`.

## Points d’attention sécurité
- Mots de passe hashés (BCrypt) et jamais renvoyés.
- Filtre JWT dédié dans la Gateway + filtre applicatif dans chaque service.
- Upload média : validation type MIME + magic number + limite 2 Mo + signature HMAC.
- Headers de sécurité CSP, X-Frame, X-Content configurés côté Gateway/Nginx.
- Passage en production : activer HTTPS (cf. `docs/DEPLOYMENT.md`) et préférer des cookies HttpOnly pour les tokens.

## Aller plus loin
- Publier les images Docker (`docker compose build && docker compose push`).
- Remplacer la persistance Mongo par un cluster managé (Atlas/DocumentDB) et gérer les credentials via secrets manager.
- Brancher un bus d’événements (Kafka/Rabbit) en remplaçant `ProductEventPublisher`.
- Étendre la couverture Playwright et intégrer des tests de charge (k6, Gatling).

Bon développement ! 🚀
