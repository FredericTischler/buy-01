# Audit Expectations

1. **Initial Setup & Access** – Docker Compose start, service health, access to front & swagger.
2. **User & Product CRUD** – Role checks, ownership, end-to-end CRUD scenarios.
3. **Authentication & Role Validation** – JWT issuance, refresh flow, guards.
4. **Media Upload & Product Association** – File size/type validation, secure URLs, product linkage.
5. **Frontend Interaction** – Pages (Sign-In/Up, Dashboard, Media Manager, Listing) behaviour.
6. **Security** – Password hashing, secret management, HTTPS readiness, security headers, signed URLs.
7. **Code Quality and Standards** – Project structure, validation, logging, profiles, formatting.
8. **Frontend Implementation** – Angular architecture, interceptors, guards, form validation.
9. **Error Handling & Edge Cases** – Validation responses, unauthorized actions, >2 MB rejection, double email handling.

For each item the audit report must document: procedure, observed result, evidence (command/log), status (✅/❌) and remediation if failing.
