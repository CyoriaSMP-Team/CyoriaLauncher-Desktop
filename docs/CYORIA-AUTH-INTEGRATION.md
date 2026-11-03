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

## Audit on 2026-11-03

- Production discovery was reachable at `https://auth.cyoriasmp.com/.well-known/openid-configuration`.
- Advertised token endpoint authentication methods: `client_secret_basic` and `client_secret_post`; **public client `none` not advertised**. Electron cannot safely ship a client secret. Enable/register a real PKCE public desktop client and test end to end before calling the optional sign-in live.
- Former VoxelX Discord-link IPC now invokes Cyoria identity OIDC; an unverified/missing `discord_user_id` is rejected. Existing Microsoft and offline Minecraft accounts remain independent.
- The old VoxelX account password/email screen and network lookup were retired in favor of local account details. Previous account data directories are untouched.

## Desktop integration verification (3 November 2026)

- The Cloudflare custom domain `auth.cyoriasmp.com` currently maps to Worker `cyoria-discord-oidc` (production).
- OIDC discovery currently advertises `client_secret_basic`, `client_secret_post` but **not** `none`. Do not ship a shared client secret in an Electron executable. Production worker was not modified during this Launcher update.
- To enable desktop sign-in, register an explicit public `Cyoria Launcher` client, enforce Authorization Code + PKCE S256, loopback redirect policy, and return verified `discord_user_id` through userinfo when Discord is linked.
- Before production rollout, check signed ID-token claims, issuer, nonce, audience and subject correlation, as well as expiry, cancellation and reload behavior. Launcher login remains optional and must never grant Microsoft Minecraft ownership.
- Cyoria account metadata and Discord-link IPC updates now require an authenticated issuer identity; a renderer-supplied Discord ID alone cannot authorize linkage.
- The upstream Microsoft OAuth window now supports cancellation and checks exact redirect origin/path plus state. A real Microsoft sign-in test is still required before claiming end-to-end login compatibility.
