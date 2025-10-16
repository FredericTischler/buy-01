# Webapp buy-01

Front-end Angular 18 de la plateforme **buy-01**. L'application consomme l'API via l'API Gateway et propose un portail client/vendeur complet (catalogue, dashboard vendeur, media manager, profil).

## Stack & Architecture

- Angular 18 (NgModules, App Router)
- TypeScript strict + ESLint + Prettier
- Tailwind CSS + spartan/ui (thème *helm*)
- Option Taiga UI (non utilisée pour l'instant)
- Gestion d'état légère via `signal`
- API services : Auth, Users, Products, Media
- Intercepteurs : Auth (JWT), Retry, Error
- Modules fonctionnels : `auth`, `catalog`, `seller`, `media`, `profile`
- Design responsive, mode sombre, respect a11y (focus visible, ARIA)

## Pré-requis

- Node.js 20+
- npm 10+

## Installation

```bash
npm ci
```

### Variables d'environnement

Les valeurs consommées côté front sont définies dans `src/environments/` :

| Nom | Description | Défaut |
| --- | --- | --- |
| `apiBaseUrl` | URL de l'API Gateway | `http://localhost:8080` |
| `maxImageMb` | Taille max upload médias | `2` |

Adapter `environment.ts` / `environment.prod.ts` selon vos environnements.

## Scripts npm

```bash
npm run start        # Dev server (http://localhost:4200)
npm run lint         # ESLint (Angular + TypeScript strict)
npm run test         # Tests unitaires Karma (ChromeHeadless)
npm run build        # Build production
npm run format:fix   # Formatage Prettier
```

Les tests CI utilisent un Chromium headless (Playwright installe les dépendances nécessaires).

## Docker

Un `Dockerfile` multi-stage est disponible. Il construit l'app puis la sert via nginx avec des en-têtes de sécurité pré-configurés.

```bash
docker build -t buy01-webapp frontend/webapp
docker run -p 8080:80 buy01-webapp
```

Le fichier `nginx.conf` applique CSP, HSTS, X-Frame-Options, etc.

## Intégration Continue

Le workflow `.github/workflows/ci.yml` :

1. Build backend (Maven)
2. Lint / tests Angular (`ChromeHeadless`)
3. Build production (`ng build --configuration production`)
4. Build images Docker via `infra/docker-compose.yml`

## Structure des modules

```
src/
  app/
    core/        # services transverses, interceptors, guards
    shared/      # UI components (spartan/ui), directives, pipes
    layout/      # shell, header, nav, footer
    features/
      auth/      # Signin / signup
      catalog/   # Catalogue public + détail produit
      seller/    # Dashboard vendeur (CRUD produit)
      media/     # Media manager (upload ≤ 2 MB, drag & drop)
      profile/   # Profil utilisateur & mot de passe
```

## Conventions

- Change detection `OnPush`
- `trackBy` systématique sur les listes
- `ReactiveFormsModule` pour les formulaires
- Services API centralisés, mapping erreurs via `ToastService`
- Intercepteurs :
  - `AuthInterceptor` : Bearer JWT
  - `RetryInterceptor` : backoff sur GET 5xx
  - `ErrorInterceptor` : toasts + redirections (401/403/413)

## Développement

```bash
npm run start
# http://localhost:4200 (API attendue sur environment.apiBaseUrl)
```

## Tests

```bash
# Lint
npm run lint

# Unit tests (Karma ChromeHeadless)
CHROME_BIN=$(npx playwright executable-path chromium) npm run test -- --watch=false --browsers=ChromeHeadless
```

## Build production

```bash
npm run build -- --configuration production
```

Les artefacts sont générés dans `dist/webapp/`.
