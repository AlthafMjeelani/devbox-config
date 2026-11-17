---
name: linux-server-hardening
description: Set up and harden Linux servers and reverse proxies (SSH, firewall, nginx, TLS, systemd, updates). Use for VPS setup, nginx config, or server security review.
---

# Linux server and nginx hardening

## Access
- SSH keys only: `PasswordAuthentication no`, `PermitRootLogin no`. Use a non-root sudo user. Consider `fail2ban`.
- Firewall default deny (`ufw` or `nftables`); open only 22 (restricted if possible), 80, 443.
- Keep a second session open when changing SSH or firewall rules to avoid lockout.

## Services
- Run apps under systemd with a dedicated user: `NoNewPrivileges`, `ProtectSystem=strict`, `PrivateTmp`, `Restart=on-failure`.
- Unattended security updates on. Remove unused packages and open ports (`ss -tlnp`).

## nginx and TLS
- Terminate TLS with Let's Encrypt (certbot or Caddy). TLS 1.2+ only; redirect HTTP to HTTPS.
- Security headers: HSTS, `X-Content-Type-Options`, a Content-Security-Policy, frame protections.
- Rate limit sensitive routes. Set body size and timeouts. Hide version with `server_tokens off`.
- Always `nginx -t` before `systemctl reload nginx`.

## Backups
- Automate off-host backups and test a restore.

Related: `secrets-and-supply-chain`, `security-review`, `observability-and-monitoring`.
