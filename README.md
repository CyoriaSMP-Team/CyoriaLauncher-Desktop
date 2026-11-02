# Cyoria Launcher

**Your Minecraft. Your Servers. Your Choice.**

Cyoria Launcher is an independent, cross-platform Minecraft: Java Edition launcher maintained by the CyoriaSMP Team. It is designed for players to launch Minecraft and join **any compatible Minecraft server** — not just CyoriaSMP.

> Development branch: features below describe the inherited application and intended behavior. Availability and successful game launch on each OS still require verification.

## Core principles

- **Server freedom:** Enter a custom server IP/domain; add, edit, remove, and manage server bookmarks. Never force CyoriaSMP as the only destination.
- **Player ownership:** Profiles, worlds, mods, saves, and settings belong to the player. No unnecessary platform lock-in.
- **Optional discovery:** CyoriaSMP may appear as a featured server or an optional quick-connect destination. Never silently override a selected server.
- **Minecraft authentication:** Use supported Microsoft authentication flows. Do not replace legitimate Minecraft account verification with custom server SSO.
- **Privacy:** No mandatory Cyoria account to launch an already authenticated Minecraft installation. No undocumented telemetry.
- **Upstream selectively:** Integrate upstream fixes or improvements only after reviewing behavior, licenses, security, and regression risk.

## Technology and inherited functionality

- Electron, React, Vite.
- Multi-profile management, Java runtime management, and mod loader integrations.
- Modpack and mod management with supported providers.
- Game logs and crash troubleshooting.
- Windows, Linux, and macOS packaging targets are configured; these do **not** guarantee tested release artifacts.

## Current release blockers

1. Finish first-party icons and branding across splash, window title, UI, and installer assets.
2. Audit inherited hard-coded VoxelX/Martian/FoxStudio endpoints, platform-specific integrations, and IPC handlers. Keep license and attribution notices.
3. Implement and test neutral server bookmarks and optional CyoriaSMP featured entry. No forced server routing.
4. Verify Microsoft sign-in, session refresh, profile isolation, game launch, and clean-install flows.
5. Verify Windows/Linux/macOS packaging, updates, and data migration before publishing installers.
6. Evaluate upstream React lazy loading, initial setup, and server-bookmark changes as independent, reviewable patches instead of merging upstream blindly.

## Development

```bash
npm install
npm run electron:dev
npm run lint
npm run electron:build
```

Development builds should not be considered a public release until installation and actual Minecraft launch have been tested.

## Origin and licensing

This project is adapted from [VoxelXClient by FoxStudio](https://github.com/foxstudio-201/VoxelXClient), and its existing Minecraft launcher components. The source license is MIT; see [LICENSE](LICENSE). Original contributor credits and copyright notices must be preserved when distributing modified copies.

This is an unofficial Minecraft launcher, not endorsed by Mojang or Microsoft.

## Project

- [Source code](https://github.com/CyoriaSMP-Team/CyoriaLauncher-Desktop)
- [Issues](https://github.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/issues)
- [Releases](https://github.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/releases)
