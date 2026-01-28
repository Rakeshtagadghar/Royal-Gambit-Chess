# RoyalGambit Desktop App

This document covers how to develop, build, and release the RoyalGambit desktop application using Tauri.

## Prerequisites

- **Node.js** v20+
- **pnpm** v9+
- **Rust** (latest stable) - [Install Rust](https://rustup.rs/)
- **Platform-specific dependencies:**
  - **Windows:** Visual Studio Build Tools with C++ workload
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev`

## Project Structure

```
src-tauri/
├── Cargo.toml           # Rust dependencies
├── tauri.conf.json      # Main Tauri configuration
├── tauri.conf.production.json  # Production overrides
├── capabilities/
│   └── default.json     # Security permissions
├── icons/               # App icons (all sizes)
└── src/
    └── main.rs          # Rust entry point
```

## Running Desktop Dev Locally

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   # Copy the desktop environment example
   cp .env.desktop.example .env.desktop.local

   # Edit with your staging Supabase credentials
   # NEVER use production credentials for local development
   ```

3. **Start the desktop app in dev mode:**
   ```bash
   pnpm tauri:dev
   ```

   This will:
   - Start the Next.js dev server on `http://localhost:3000`
   - Launch the Tauri desktop window pointing to the dev server
   - Enable hot reload for both frontend and Rust changes

## Building for Different Environments

### Development Build

```bash
pnpm tauri:dev
```

Uses `.env.local` or `.env.desktop.local` for configuration.

### Production Build

The desktop app loads the deployed web application in a native window. This means:
- All API routes work normally (they run on the deployed server)
- Server-side features work as expected
- The desktop app is essentially a native wrapper around the web app

```bash
pnpm tauri:build
```

**Important:** Before building for production, update `frontendDist` in `src-tauri/tauri.conf.json` to point to your deployed web app URL (e.g., `https://royalgambit.vercel.app`).

### Platform-Specific Builds

```bash
# Windows (x64)
pnpm tauri:build:windows

# macOS (Apple Silicon)
pnpm tauri:build:macos-arm

# macOS (Intel)
pnpm tauri:build:macos-x64

# Linux (x64)
pnpm tauri:build:linux
```

Build outputs are located in:
- **Windows:** `src-tauri/target/release/bundle/msi/` and `bundle/nsis/`
- **macOS:** `src-tauri/target/release/bundle/dmg/` and `bundle/macos/`
- **Linux:** `src-tauri/target/release/bundle/appimage/` and `bundle/deb/`

## Publishing Releases

### Automated Releases (Recommended)

Releases are automated via GitHub Actions when you push a version tag:

```bash
# Update version in package.json and src-tauri/Cargo.toml
# Then create and push a tag

git tag v0.2.0
git push origin v0.2.0
```

This triggers the `desktop-release.yml` workflow which:
1. Builds for Windows, macOS (arm64 + x64), and Linux
2. Creates installers (MSI, EXE, DMG, AppImage, DEB)
3. Generates checksums
4. Creates a GitHub Release with all artifacts

### Manual Release

You can also trigger a release manually from the GitHub Actions tab:
1. Go to Actions > Desktop Release
2. Click "Run workflow"
3. Choose whether to create as draft

### Code Signing

For production releases, configure these secrets in GitHub:

**macOS:**
- `APPLE_CERTIFICATE` - Base64 encoded .p12 certificate
- `APPLE_CERTIFICATE_PASSWORD` - Certificate password
- `APPLE_SIGNING_IDENTITY` - e.g., "Developer ID Application: Your Name"
- `APPLE_ID` - Apple ID email
- `APPLE_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Team ID

**Windows:**
- Configure `certificateThumbprint` in `tauri.conf.json` for EV signing

## Security Considerations

### CSP (Content Security Policy)

The app enforces strict CSP rules defined in `tauri.conf.json`:
- Only allows connections to Supabase domains
- Blocks iframe embedding
- Restricts script execution

### Domain Allowlist

Remote URLs are restricted via `capabilities/default.json`:
- Only `*.supabase.co` domains are allowed
- No arbitrary navigation to external sites

### No Service Keys in Client

**Critical:** Never include `SUPABASE_SERVICE_ROLE_KEY` in desktop builds. Only use `NEXT_PUBLIC_*` keys (anon/public keys).

### Environment Gating

Destructive endpoints (DB reset, seed) should be disabled in production builds. Check `NEXT_PUBLIC_APP_ENV` to gate features:

```typescript
const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';
if (!isProduction) {
  // Enable debug/admin features
}
```

## Generating App Icons

Generate all required icon sizes from a single 1024x1024 PNG:

```bash
pnpm tauri icon path/to/icon.png
```

This creates all required formats in `src-tauri/icons/`.

## Troubleshooting

### Build fails on Windows

Ensure Visual Studio Build Tools are installed with the "Desktop development with C++" workload.

### Build fails on Linux

Install required dependencies:
```bash
sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

### App doesn't connect to Supabase

Check that environment variables are set correctly. In production builds, environment variables are baked in at build time.

### Hot reload not working

Ensure the Next.js dev server is running on port 3000. Check `tauri.conf.json` `devUrl` setting.
