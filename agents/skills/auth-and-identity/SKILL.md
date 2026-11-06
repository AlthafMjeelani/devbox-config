---
name: auth-and-identity
description: Implement authentication and authorization - OAuth2/OIDC, JWT with rotation, RBAC/ABAC, secure token storage in Flutter (flutter_secure_storage) and React (cookies).
---

# Auth and Identity

## Principles
- Prefer an established provider/library over custom crypto. Never roll your own hashing; use argon2id or bcrypt.
- Short-lived access tokens (5-15 min) + rotating refresh tokens with reuse detection (revoke the whole family on reuse).
- Authorization is checked server-side on every request; client checks are UX only.

## OAuth2 / OIDC
- Web and mobile: Authorization Code + PKCE. Never implicit flow.
- Validate `iss`, `aud`, `exp`, `nonce`, and signature (JWKS, cache keys, handle rotation).

## JWT
- Sign with RS256/EdDSA for multi-service; HS256 only for a single trusted service.
- Keep claims minimal (sub, roles, exp). No PII or secrets in the payload.
- Rotation: issue new refresh token on each use, store hash server-side, bind to device/session.

## RBAC / ABAC
- RBAC for coarse roles (admin, member). Add ABAC policies (owner, tenant, resource attributes) for fine-grained rules.
- Centralize policy in one module/middleware (e.g. Nest guards, Laravel Policies, Casbin/OPA).

## Client storage
- **Flutter**: `flutter_secure_storage` (Keychain/Keystore) for refresh tokens; keep access token in memory. Dio interceptor refreshes on 401 with a single-flight lock.
- **React**: HttpOnly, Secure, SameSite=Lax/Strict cookies for tokens; CSRF token for cookie-auth mutations. Never put tokens in localStorage.

## Checklist
Rate-limit login, lockout/backoff, MFA path, logout revokes server-side, password reset tokens single-use and expiring, audit log for auth events.
