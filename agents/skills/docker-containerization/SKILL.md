---
name: docker-containerization
description: Build small, secure, reproducible container images and local Compose stacks. Use for Dockerfiles, image size, Compose, registries, or container build and runtime problems.
---

# Docker and containers

## Dockerfile
- Pin base images by version (digest for production). Prefer slim or distroless; avoid `latest`.
- Multi-stage builds: build in one stage, copy only artifacts into a minimal runtime stage.
- Order layers for cache: copy lockfiles, install dependencies, then copy source.
- Keep a `.dockerignore` (`.git`, `node_modules`, `.env*`, build output, tests).
- Run as a non-root `USER`. Set `HEALTHCHECK`. Use `exec` form for `CMD` so signals reach the process.
- Never bake secrets into layers or build args. Use BuildKit `--mount=type=secret` or runtime env.

## Compose (local dev)
- One service per process. Use `depends_on` with `condition: service_healthy`.
- Named volumes for data, bind mounts only for source. Keep ports bound to `127.0.0.1` unless needed.
- Read config from `.env` (ignored) with a tracked `.env.example` (see `env-and-secrets`).

## Verify
- `docker build` succeeds from a clean checkout; check size with `docker images` and layers with `docker history`.
- Scan with `trivy image` or `docker scout` when available; report findings by severity.
- Run the container and hit its health endpoint before saying it works.

Related: `kubernetes-ops`, `github-actions-ci`, `secrets-and-supply-chain`.
