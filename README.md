<div align="center">

<br/>

<!-- Logo -->
<img src="https://raw.githubusercontent.com/foxstudio-201/VoxelXClient/main/public/icon.png" width="96" height="96" alt="VoxelXLauncher Logo" />

<h1>VoxelXLauncher</h1>

<p>
  <strong>The Ultimate Minecraft Launcher</strong>
  <br/>
  Manage profiles, install mods, and launch any Minecraft version — all in one place.
</p>

<p>
  <a href="https://github.com/foxstudio-201/VoxelXClient/releases"><img src="https://img.shields.io/github/package-json/v/foxstudio-201/VoxelXClient?style=for-the-badge&label=version&labelColor=0a0a0a&color=4ade80" alt="Version" /></a>
  <a href="https://github.com/foxstudio-201/VoxelXClient/releases"><img src="https://img.shields.io/github/downloads/foxstudio-201/VoxelXClient/total?style=for-the-badge&label=downloads&labelColor=0a0a0a&color=22c55e" alt="Downloads" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge&labelColor=0a0a0a" alt="License" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Windows-0078D4?style=flat-square&labelColor=0a0a0a&logo=windows11&logoColor=0078D4" alt="Windows" />
  <img src="https://img.shields.io/badge/Linux-FCC624?style=flat-square&labelColor=0a0a0a&logo=linux&logoColor=FCC624" alt="Linux" />
  <img src="https://img.shields.io/badge/Arch_(AUR)-1793D1?style=flat-square&labelColor=0a0a0a&logo=archlinux&logoColor=1793D1" alt="Arch AUR" />
  <img src="https://img.shields.io/badge/macOS-white?style=flat-square&labelColor=0a0a0a&logo=apple&logoColor=white" alt="macOS" />
  <img src="https://img.shields.io/badge/Electron_42-47848F?style=flat-square&labelColor=0a0a0a&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&labelColor=0a0a0a&logo=react" alt="React" />
</p>

<p>
  <a href="#download"><b>Download</b></a> &nbsp;·&nbsp;
  <a href="#features">Features</a> &nbsp;·&nbsp;
  <a href="#getting-started">Build from Source</a> &nbsp;·&nbsp;
  <a href="https://voxelxclient.vercel.app">Website</a> &nbsp;·&nbsp;
  <a href="https://join.foxstudio.site">Discord</a>
</p>

<br/>

</div>

<!-- CYTECH_README_REFRESH:START -->
<p align="center"><img alt="Desktop Minecraft launcher section accent" width="100%" height="10" src="https://capsule-render.vercel.app/api?type=rect&color=0:0F172A,100:6366F1&height=10&section=header"></p>

<p align="center"><sub>Desktop Minecraft launcher</sub></p>

<p align="center"><a href="#features">Features</a> &nbsp;·&nbsp; <a href="#download">Download</a> &nbsp;·&nbsp; <a href="#getting-started">Getting Started</a> &nbsp;·&nbsp; <a href="#tech-stack">Tech Stack</a> &nbsp;·&nbsp; <a href="https://github.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/issues">Issues</a> &nbsp;·&nbsp; <a href="https://github.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/releases">Releases</a></p>

<!-- CYTECH_README_REFRESH:END -->

> [!NOTE]
> The README currently includes material and assets from [VoxelXClient](https://github.com/foxstudio-201/VoxelXClient). That source attribution remains intact; packaging and branding should be checked before a public CyoriaLauncher release.

---

## Features

| | Feature | Description |
|:--:|---|---|
| <img src="https://api.iconify.design/ph:folders-duotone.svg?color=%234ade80&width=24" width="24" /> | **Multi-Profile** | Unlimited profiles — each with its own loader, version, mods and settings |
| <img src="https://api.iconify.design/ph:shield-check-duotone.svg?color=%234ade80&width=24" width="24" /> | **Microsoft Login** | Secure OAuth2 authentication, tokens auto-refreshed |
| <img src="https://api.iconify.design/ph:package-duotone.svg?color=%234ade80&width=24" width="24" /> | **Mod Support** | Import modpacks from CurseForge & Modrinth via drag-and-drop |
| <img src="https://api.iconify.design/ph:coffee-duotone.svg?color=%234ade80&width=24" width="24" /> | **Java Auto-Install** | Detects and downloads the correct Java runtime per Minecraft version |
| <img src="https://api.iconify.design/ph:terminal-window-duotone.svg?color=%234ade80&width=24" width="24" /> | **Real-Time Logs** | Color-coded game logs (INFO / WARN / ERROR / DEBUG) with copy support |
| <img src="https://api.iconify.design/ph:game-controller-duotone.svg?color=%234ade80&width=24" width="24" /> | **Discord RPC** | Rich Presence shows your current profile and playtime automatically |
| <img src="https://api.iconify.design/ph:chart-bar-duotone.svg?color=%234ade80&width=24" width="24" /> | **Play Stats** | Tracks hours played, world count, and mod count per profile |
| <img src="https://api.iconify.design/ph:bell-duotone.svg?color=%234ade80&width=24" width="24" /> | **Notifications** | Toast notifications with sound for launch events |

### Loader Support

<table>
  <tr>
    <td align="center"><img src="https://api.iconify.design/ph:cube-duotone.svg?color=%234ade80&width=30" width="30" /><br/><b>Vanilla</b><br/><sub>Official</sub></td>
    <td align="center"><img src="https://api.iconify.design/ph:needle-duotone.svg?color=%234ade80&width=30" width="30" /><br/><b>Fabric</b><br/><sub>Supported</sub></td>
    <td align="center"><img src="https://api.iconify.design/ph:hammer-duotone.svg?color=%234ade80&width=30" width="30" /><br/><b>Forge</b><br/><sub>Supported</sub></td>
    <td align="center"><img src="https://api.iconify.design/ph:gear-duotone.svg?color=%234ade80&width=30" width="30" /><br/><b>NeoForge</b><br/><sub>Supported</sub></td>
    <td align="center"><img src="https://api.iconify.design/ph:fire-duotone.svg?color=%234ade80&width=30" width="30" /><br/><b>CurseForge</b><br/><sub>Import</sub></td>
    <td align="center"><img src="https://api.iconify.design/ph:leaf-duotone.svg?color=%234ade80&width=30" width="30" /><br/><b>Modrinth</b><br/><sub>Import</sub></td>
  </tr>
</table>

---

## Download

> Java is bundled and managed automatically — **no manual setup** needed on any platform.

Grab the latest build from the **[Releases](https://github.com/foxstudio-201/VoxelXClient/releases/latest)** page.

<table>
  <tr>
    <th align="left">Platform</th>
    <th align="left">Recommended file</th>
    <th align="left">Notes</th>
  </tr>
  <tr>
    <td><img src="https://api.iconify.design/ph:windows-logo-duotone.svg?color=%234aa3df&width=18" width="18" align="absmiddle" /> <b>Windows</b></td>
    <td><code>VoxelXLauncher Setup x.y.z.exe</code></td>
    <td>Installer · portable <code>.exe</code> also available</td>
  </tr>
  <tr>
    <td><img src="https://api.iconify.design/ph:linux-logo-duotone.svg?color=%23e0a23b&width=18" width="18" align="absmiddle" /> <b>Linux</b></td>
    <td><code>VoxelXLauncher-x.y.z.AppImage</code></td>
    <td>Run anywhere · <code>.deb</code> also provided</td>
  </tr>
  <tr>
    <td><img src="https://api.iconify.design/simple-icons:archlinux.svg?color=%231793D1&width=18" width="18" align="absmiddle" /> <b>Arch Linux</b></td>
    <td><code>yay -S voxelxlauncher-bin</code></td>
    <td>Installed straight from the AUR</td>
  </tr>
  <tr>
    <td><img src="https://api.iconify.design/ph:apple-logo-duotone.svg?color=%23b0b0b0&width=18" width="18" align="absmiddle" /> <b>macOS</b> (Apple Silicon)</td>
    <td><code>VoxelXLauncher-x.y.z-arm64.dmg</code></td>
    <td>M1 / M2 / M3</td>
  </tr>
  <tr>
    <td><img src="https://api.iconify.design/ph:apple-logo-duotone.svg?color=%23b0b0b0&width=18" width="18" align="absmiddle" /> <b>macOS</b> (Intel)</td>
    <td><code>VoxelXLauncher-x.y.z-x64.dmg</code></td>
    <td>Intel-based Macs</td>
  </tr>
</table>

<details>
<summary><b>Arch Linux — install via AUR</b></summary>

<br/>

```bash
yay -S voxelxlauncher-bin
# or
paru -S voxelxlauncher-bin
```

The package downloads the official AppImage and installs it system-wide.
See [`packaging/aur/`](packaging/aur/) for the PKGBUILD and publishing details.

</details>

<details>
<summary><b>Linux — run the AppImage</b></summary>

<br/>

```bash
chmod +x VoxelXLauncher-*.AppImage
./VoxelXLauncher-*.AppImage
```

</details>

<details>
<summary><b>macOS — first launch (unsigned app)</b></summary>

<br/>

The app is **not code-signed**, so Gatekeeper will warn on first launch:

1. Right-click **VoxelXLauncher.app** → **Open**
2. Confirm **Open** in the dialog

You only need to do this once.

</details>

<details>
<summary><b>Windows — SmartScreen warning</b></summary>

<br/>

On first run Windows SmartScreen may warn. Click **More info** → **Run anyway**.

</details>

---

## Getting Started

Build VoxelXLauncher from source for development or to package your own build.

### Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **Git** — [git-scm.com](https://git-scm.com)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/foxstudio-201/VoxelXClient.git
cd VoxelXClient

# Install dependencies
npm install

# Start in development mode (Vite + Electron)
npm run electron:dev
```

### Package a Build

```bash
npm run electron:build        # build for your current OS → dist-electron/
```

Cross-platform builds are produced automatically in CI — see
[`.github/workflows/build-release.yml`](.github/workflows/build-release.yml).
Push a `v*` tag (e.g. `git tag v1.4.0 && git push --tags`) to trigger a full
Windows · Linux · macOS · AUR release.

### Handy Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server only (browser preview) |
| `npm run build` | Vite production build |
| `npm run lint` | ESLint check |
| `npm run patch:icon` | Regenerate the app icon |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS 4 |
| **Desktop Shell** | Electron 42 |
| **3D Rendering** | Three.js + React Three Fiber |
| **Auth** | Microsoft OAuth2 (MSAL) |
| **IPC** | Electron contextBridge / ipcMain |
| **Packaging** | electron-builder → NSIS · AppImage · deb · dmg · AUR |

---

## Contributing

1. Fork the repo
2. Create a branch — `git checkout -b feat/your-feature`
3. Commit your changes — `git commit -m "feat: add something"`
4. Push — `git push origin feat/your-feature`
5. Open a Pull Request

---

## License

Released under the [MIT License](LICENSE).

---

<div align="center">

Made with care by **FoxStudio**

<a href="https://voxelxclient.vercel.app">Website</a> &nbsp;·&nbsp;
<a href="https://join.foxstudio.site">Discord</a> &nbsp;·&nbsp;
<a href="https://github.com/foxstudio-201/VoxelXClient">Star on GitHub</a>

</div>

---

<!-- CYTECH_STAR_HISTORY:START -->

## Star History

<a href="https://github.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/stargazers">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/refs/heads/main/assets/star-history-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/refs/heads/main/assets/star-history-light.svg" />
    <img alt="Star history for CyoriaSMP-Team/CyoriaLauncher-Desktop" src="https://raw.githubusercontent.com/CyoriaSMP-Team/CyoriaLauncher-Desktop/refs/heads/main/assets/star-history-light.svg" width="1100" />
  </picture>
</a>

<sub>Updated automatically from GitHub's dated stargazers. Only currently starred accounts are included.</sub>

<!-- CYTECH_STAR_HISTORY:END -->
