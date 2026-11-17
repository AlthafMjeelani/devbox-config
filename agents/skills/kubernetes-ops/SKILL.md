---
name: kubernetes-ops
description: Deploy and debug workloads on Kubernetes (manifests, Helm, probes, resources, rollouts). Use for k8s manifests, Helm charts, pod failures, scaling or rollout issues.
---

# Kubernetes operations

## Before acting
- Confirm context and namespace: `kubectl config current-context`, `kubectl get ns`. Never assume production.
- Use `kubectl diff -f` or `helm diff` before apply. Prefer GitOps (Argo CD, Flux) over manual edits.
- Destructive actions (delete namespace, scale to zero, drain) need user approval.

## Manifest baseline
- Set resource `requests` and `limits`. Add readiness, liveness and startup probes with sane thresholds.
- `securityContext`: `runAsNonRoot`, `readOnlyRootFilesystem`, drop all capabilities, no privilege escalation.
- Rolling update with `maxUnavailable: 0` for user-facing services; add a `PodDisruptionBudget` and spread replicas across nodes.
- Config in ConfigMaps, secrets in Secrets or an external store; never commit secret values.
- Add `NetworkPolicy` default-deny, then allow needed paths.

## Debug order
1. `kubectl get pods -o wide`, then `describe pod` (events) and `logs --previous`.
2. `CrashLoopBackOff`: logs, exit code, probes, missing env or secrets.
3. `Pending`: resources, taints, PVC binding, quotas.
4. `ImagePullBackOff`: image tag, registry auth, network.
5. Service unreachable: selectors match labels, `get endpoints`, port names.

Related: `docker-containerization`, `observability-and-monitoring`, `deployment-strategies`.
