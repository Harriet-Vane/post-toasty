## Fix high-severity dependency vulnerabilities

The advisories all trace to `undici`, a transitive dependency of `@tanstack/react-start` (currently `1.167.50`). The fix is to bump `@tanstack/react-start` so it pulls in a patched `undici`.

### Steps
1. Upgrade `@tanstack/react-start` from `1.167.50` to the latest `1.168.26` (run `bun add @tanstack/react-start@latest`). This refreshes the transitive `undici` to a version that includes the SOCKS5 TLS bypass, WebSocket DoS, and SOCKS5 proxy pool reuse fixes.
2. Reinstall to refresh the lockfile so the new transitive `undici` is locked in.
3. Verify the build still runs and re-run the security scan to confirm the high-severity findings clear. The medium-severity undici/js-yaml/start-server-core advisories should also drop, since they share the same upstream package.

### Notes
- `@tanstack/react-router` (`1.168.25`) is already aligned with the new start version, so no separate bump needed.
- No application code changes required — this is a dependency-only update within the same minor range.
