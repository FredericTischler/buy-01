# Audit Report

## 1. Initial Setup & Access
- **Procedure testée**: `docker compose --env-file .env -f infra/docker-compose.yml up -d` puis vérification des endpoints (`curl https://localhost:8080/actuator/health`, navigation vers `https://localhost:4200`).
- **Résultat observé**: Non exécuté dans l'environnement d'évaluation (Docker indisponible dans le bac à sable).
- **Preuves / Commandes**: _À exécuter côté client_ – voir `infra/docker-compose.yml`.
- **Statut**: ❌
- **Remédiation**: Lancer la commande ci-dessus sur la machine cible, puis vérifier l'accessibilité de l'application et des Swagger (`/docs/user/swagger-ui/index.html`).

## 2. User & Product CRUD (rôles & permissions)
- **Procedure testée**: Parcours prévu via Postman collection `infra/postman/buy01-collection.json` (Register Seller → Login Seller → Create Product → List Products) avec tokens JWT.
- **Résultat observé**: Scénario documenté mais non exécuté ici (absence de backend en cours d'exécution).
- **Preuves / Commandes**: `scripts/run-newman.sh infra/postman/buy01-collection.json` (à lancer après `docker compose up`).
- **Statut**: ❌
- **Remédiation**: Démarrer la stack, exécuter le script Newman et vérifier que seules les routes SELLER aboutissent pour le propriétaire.

## 3. Authentication & Role Validation
- **Procedure testée**: Tests unitaires `backend/user-service` (JWT + refresh) + vérification des guards Angular (analyse statique du code `auth.guard.ts`, `jwt.interceptor.ts`).
- **Résultat observé**: Tests non lancés (Maven indisponible), mais la configuration Spring Security + guards Angular sont implantés.
- **Preuves / Commandes**: `mvn -f backend/pom.xml test` (échec dans le bac à sable, à rejouer localement).
- **Statut**: ❌
- **Remédiation**: Exécuter les tests Maven et réaliser un login + refresh via Postman pour confirmer la rotation des tokens.

## 4. Media Upload & Product Association
- **Procedure testée**: Tests d'intégration `MediaControllerIntegrationTests` (upload PNG valide, rejet >2MB) + inspection du service `ProductService` (validation batch via secret interne).
- **Résultat observé**: Tests compilés mais non exécutés (manque Maven). Logique de validation croisée présente.
- **Preuves / Commandes**: `mvn -f backend/pom.xml -pl media-service test` (à relancer localement).
- **Statut**: ❌
- **Remédiation**: Lancer les tests, puis via dashboard Angular uploader une image et créer un produit pour vérifier l'association et la signature d'URL.

## 5. Frontend Interaction
- **Procedure testée**: Analyse de l'application Angular (routes `app.routes.ts`, composants `sign-in`, `sign-up`, `dashboard`, `media-manager`, `product-list`). Playwright E2E planifié (`npm run e2e`).
- **Résultat observé**: Non exécuté (npm indisponible). Les composants assurent validation réactive, garde SELLER et upload 2 MB côté client.
- **Preuves / Commandes**: `npm install --prefix frontend/webapp` puis `npm run e2e --prefix frontend/webapp`.
- **Statut**: ❌
- **Remédiation**: Installer les dépendances, lancer les tests E2E et effectuer un parcours manuel (inscription, dashboard, media, catalogue).

## 6. Security
- **Procedure testée**: Revue de code – `SecurityConfig` (gateway & services), BCrypt dans `UserService`, signed URLs (`StorageService`), headers Nginx (`infra/nginx/default.conf`), documentation HTTPS (`docs/DEPLOYMENT.md`).
- **Résultat observé**: Contrôles implémentés conformément aux exigences.
- **Preuves / Commandes**: Analyse statique des fichiers cités; variables d'environnement listées dans `.env.example`.
- **Statut**: ✅
- **Remédiation**: Aucune – prévoir rotation régulière des secrets et activer TLS via reverse proxy en production.

## 7. Code Quality and Standards
- **Procedure testée**: Vérification de la structure (microservices isolés, DTO + validation, contrôleurs minces, `@ControllerAdvice`), outils (Spotless, ESLint, GitHub Actions CI).
- **Résultat observé**: Config outillage complète, CI workflow `ci.yml` couvrant build/tests/lint/Docker.
- **Preuves / Commandes**: `mvn -f backend/pom.xml spotless:check`, `npm run lint --prefix frontend/webapp` (à exécuter localement) ; workflow `.github/workflows/ci.yml`.
- **Statut**: ✅
- **Remédiation**: Lancer effectivement les commandes de linting dans l'environnement cible.

## 8. Frontend Implementation
- **Procedure testée**: Revue des modules standalones, interceptors (`jwt.interceptor.ts`, `error.interceptor.ts`), guards, reactive forms, composants de gestion média.
- **Résultat observé**: Architecture conforme, validations formulaires et messages d'erreurs explicites.
- **Preuves / Commandes**: Inspection de `frontend/webapp/src/app/**` ; Playwright configuré (`playwright.config.ts`).
- **Statut**: ✅
- **Remédiation**: Aucune – exécuter les tests unitaires/E2E une fois les dépendances installées.

## 9. Error Handling & Edge Cases
- **Procedure testée**: Revue des `GlobalExceptionHandler` (user/product/media), validations Bean, messages explicites (ex: email dupliqué, limite 2 MB, tentative CLIENT → 403).
- **Résultat observé**: Gestion centralisée et messages adaptés présents dans le code.
- **Preuves / Commandes**: Analyse statique des fichiers `exception/GlobalExceptionHandler.java`, tests d'intégration écrits (`ProductServiceIntegrationTests`, `MediaControllerIntegrationTests`).
- **Statut**: ✅
- **Remédiation**: Couvrir par des tests automatisés lors de l'exécution locale (voir sections précédentes).
