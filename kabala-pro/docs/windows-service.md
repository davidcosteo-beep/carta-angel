# Kabala Pro 1.0 - Windows local production service

Kabala Pro 1.0 runs as a local Windows product with one Windows service:

- Service: `KabalaPro`
- Port: `4000`
- Backend: Express API from `backend/server.js`
- Frontend: compiled Vite/PWA files from `dist`, served by Express
- Health check: `http://localhost:4000/health`

## Recommended architecture

Use one Windows service.

Express already serves the API routes first:

- `/api/auth`
- `/api/pdf`
- `/api/pacientes`
- `/api/citas`
- `/health`
- `/pdfs`

After those routes, Express serves the compiled frontend from `dist` and returns `dist/index.html` for app navigation. This keeps PC, mobile, Tailscale, PWA, and PDF links on the same origin.

## Access URLs

On the same PC:

```bat
http://localhost:4000
```

From another device on the LAN:

```bat
http://PC_LOCAL_IP:4000
```

From iPhone or Android through Tailscale:

```bat
http://TAILSCALE_DEVICE_NAME:4000
```

or:

```bat
http://TAILSCALE_IP:4000
```

## Requirements

- Node.js installed and available in `PATH`
- NSSM available at `tools\nssm\nssm.exe` or installed in `PATH`
- SQL Server reachable from the PC running the service
- Backend environment configured in `backend\.env`
- Windows Firewall allowing inbound TCP port `4000` when mobile/Tailscale access is needed

## Build frontend dist

Run from the project root:

```bat
scripts\windows\build-frontend.bat
```

This creates:

```bat
dist\index.html
dist\sw.js
dist\manifest.webmanifest
dist\assets\...
```

## Install backend dependencies

Run from the project root:

```bat
cd backend
npm.cmd install
cd ..
```

## Initialize database

Preferred:

```bat
scripts\windows\init-database.bat
```

The script creates the database/tables if missing and prompts for the initial master password. The password is hashed with bcrypt and is not written to frontend files, `dist`, localStorage, or SQL as plain text.

## Install service

Run Command Prompt or PowerShell as Administrator:

```bat
scripts\windows\install-kabala-service.bat
```

The script installs:

```bat
nssm install KabalaPro "C:\Path\To\node.exe" "server.js"
nssm set KabalaPro AppDirectory "D:\Path\To\kabala-pro\backend"
nssm set KabalaPro Start SERVICE_AUTO_START
nssm set KabalaPro AppEnvironmentExtra "NODE_ENV=production" "PORT=4000"
nssm start KabalaPro
```

Logs are written to:

```bat
backend\logs\kabala-pro.out.log
backend\logs\kabala-pro.err.log
```

## Start service

```bat
scripts\windows\start-kabala-service.bat
```

## Stop service

```bat
scripts\windows\stop-kabala-service.bat
```

## Uninstall service

Run as Administrator:

```bat
scripts\windows\uninstall-kabala-service.bat
```

## Test commands

Build:

```bat
npm.cmd run build
```

Backend production process without installing the service:

```bat
cd backend
set NODE_ENV=production
set PORT=4000
npm.cmd start
```

Health:

```bat
curl http://localhost:4000/health
```

Frontend:

```bat
curl http://localhost:4000
```

## Final validation checklist

- Login
- Generate carta online
- Generate carta offline
- Patients
- Agenda
- Voice dictation
- Access from PC at `http://localhost:4000`
- Access from iPhone/Android through Tailscale at `http://TAILSCALE_DEVICE_NAME:4000`
- PDF generation creates files under `backend\storage\pdfs`
- PDF links open from `/pdfs/...`
