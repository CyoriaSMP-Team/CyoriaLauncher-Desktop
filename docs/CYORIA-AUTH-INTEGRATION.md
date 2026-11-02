# Cyoria Launcher central identity (development)

## Architecture

- Optional launcher-facing OIDC issuer: https://auth.cyoriasmp.com
- Minecraft Microsoft authentication remains separate, with Mojang entitlement/session validation.
- Cyoria account does NOT auto-create a Minecraft account, alter Java/Bedrock UUID, or lock server choice.
- Backend API at api.cyoriasmp.com is not itself the OIDC issuer; never send service keys to the desktop application.
- The upstream VoxelX account/skin lookup has been removed from AccountPage; local skin preferences remain.

## Setup required before user sign-in works

1. Register **Cyoria Launcher** as a public desktop OIDC client with the existing Cloudflare Worker issuer.
2. Allow Authorization Code + PKCE (S256) with loopback redirect http://127.0.0.1:{ephemeral-port}/callback. If the issuer cannot support dynamic loopback ports, adjust the supported registration policy and client implementation together.
3. Supply the registered public client ID to the Electron main process in `CYORIA_OIDC_CLIENT_ID`. There is no embedded client secret.
4. Check discovery and userinfo support on the production OIDC worker. Review and verify OIDC ID-token signature, audience, nonce, and claims before treating this as an authenticated persistent session. Current module only maintains a transient userinfo-backed connection and DOES NOT store a durable token.
5. Perform end-to-end login, logout, expiration, cancellation, and token refresh tests.
6. Link Cyoria Identity to Minecraft identity **only** via explicit user consent and proof of ownership on the backend. Never equate usernames, offline UUIDs, Floodgate XUIDs, or Discord IDs without verified linking.

## Security/release gates

- Preserve auth.cyoriasmp.com Worker custom domain and existing OIDC clients.
- Do not put `X-Cyoria-Service-Key`, client secrets, refresh tokens, or private keys into repository or browser UI.
- Do not auto-import credentials from AuthMe/CyoriaCore or silently merge identities.
- Cyoria Auth unavailable: do not unlock Cyoria-account-protected features. Minecraft launch for independent servers remains unaffected.
- Existing user data directory remains unchanged until an explicit tested migration is written; rebranding application metadata does NOT mean deleting or relocating saved accounts.
- Use development/test environment before registering release desktop clients.

## Status

Implementation on feature branch: OIDC discovery, PKCE flow, loopback response, userinfo and optional Account UI are **code-complete for review only**. Live login is BLOCKED until client registration and security/end-to-end verification. Nothing is deployed to Minecraft production.
