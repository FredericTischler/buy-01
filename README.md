# user-service

Java 17 Spring Boot microservice providing authentication and user profile management for the shop platform. Users are stored in MongoDB with salted BCrypt hashes and JWTs are issued for stateless authZ. Default port: `8081`.

## Architecture & Features
- Spring Boot 3, stateless Spring Security with a custom JWT filter, validation and actuator endpoints.
- MongoDB persistence using Spring Data (unique email index, auditing for timestamps).
- Services encapsulating password hashing (BCrypt), JWT issuing/validation, and user CRUD logic.
- Controllers covering `/auth/signup`, `/auth/login`, and `/users/me` (GET/PUT).
- Global exception handler returning RFC 7807 `application/problem+json` responses.
- Test coverage: unit tests for password/JWT services plus an integration test that boots the app against a MongoDB Testcontainer (Docker required for tests).

## Configuration
- `SPRING_DATA_MONGODB_URI` (default: `mongodb://mongo:27017/userdb`).
- `APP_JWT_SECRET` (set a strong 32+ char secret in production).
- `APP_JWT_EXPIRATION` (milliseconds, default `3600000`).
- `SERVER_PORT` or `server.port` can override the HTTP port if needed.

## Build & Run (CLI)
```bash
cd user-service
# Build without running tests
mvn -q -DskipTests package

# Build & run tests (requires Docker for Testcontainers)
mvn clean package

# Start the service locally on port 8081
mvn spring-boot:run

# Docker image
docker build -t user-service ./user-service
```

## Build & Test in IntelliJ IDEA
1. **Configure JDK 17**
   - `File > Project Structure` (`Ctrl+Alt+Shift+S`) → *SDKs* → `+` → point to a JDK 17 (Temurin, Oracle…).
   - In *Project*, set `Project SDK` to this JDK and language level to `17`.
2. **Ensure Maven view is visible**
   - `View > Tool Windows > Maven` and double-click the project’s `pom.xml` if prompted to “Add as Maven Project”.
3. **Build/Run from Maven tool window**
   - Under `Lifecycle`, double-click `clean`, then `package`. Use the toolbar ▶ icon to rerun.
   - To skip tests, right-click `package` → `Modify Run Configuration` → add `-DskipTests`.
4. **Run tests**
   - Docker Desktop/Daemon must be running (Testcontainers pulls `mongo:6.0.5`).
   - Execute `verify` or `test` goals from the Maven window or run the generated run configurations.

IntelliJ’s terminal reuses the IDE environment: if you prefer, run `mvn clean package` there after confirming `JAVA_HOME` points to the configured JDK 17.

## API
- `POST /auth/signup` — register a CLIENT or SELLER; returns `{ token, user }`.
- `POST /auth/login` — authenticate by email/password; returns `{ token, user }`.
- `GET /users/me` — fetch the authenticated profile (requires `Authorization: Bearer <JWT>`).
- `PUT /users/me` — update username/avatar for the authenticated user.

### cURL Examples
```bash
# Signup (role CLIENT)
curl -X POST http://localhost:8081/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","username":"JaneDoe","password":"StrongP@ssw0rd","role":"CLIENT"}'

# Login
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"StrongP@ssw0rd"}'

# Get profile
curl http://localhost:8081/users/me \
  -H "Authorization: Bearer <JWT>"

# Update profile
curl -X PUT http://localhost:8081/users/me \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"username":"JaneTheSeller","avatarUrl":"https://cdn.example.com/avatars/jane.png"}'
```
