# Kabala Pro 1.0 - Installer packaging

## Recommended strategy

Use a hybrid installer:

- Inno Setup copies the product files to `D:\KabalaPro`.
- Windows batch scripts initialize SQL Server and install the `KabalaPro` service.
- The backend Express service serves both API and frontend `dist` on port `4000`.

This keeps the installed product simple: one folder, one service, one port, same-origin API/PWA/offline behavior.

## Installed folder structure

```bat
D:\KabalaPro
  backend\
    server.js
    src\
    scripts\init-database.js
    assets\
    storage\pdfs\
    node_modules\
    .env
  dist\
  scripts\windows\
  docs\
  database\
  tools\nssm\nssm.exe
```

`backend\.env` must be created/configured on the installed machine from `backend\.env.example`. Do not include real production credentials in source control.

Minimum backend `.env`:

```bat
PORT=4000
DB_USER=...
DB_PASSWORD=...
DB_SERVER=...
DB_DATABASE=kabalaPro
JWT_SECRET=...
```

## NSSM recommendation

Preferred: include `nssm.exe` at:

```bat
tools\nssm\nssm.exe
```

The service scripts use that local copy first. If missing, they look for `nssm.exe` in `PATH`.

## Database initialization

Preferred method:

```bat
scripts\windows\init-database.bat
```

This runs:

```bat
backend\scripts\init-database.js --prompt-master-password
```

The script:

- Creates database `DB_DATABASE` if missing.
- Creates required tables if missing.
- Preserves existing data.
- Does not drop tables.
- Does not overwrite existing users.
- Creates `maestro@kabala.local` only if missing.
- Stores only a bcrypt password hash.

Alternative `sqlcmd` method:

```bat
sqlcmd -S SERVER -U USER -P PASSWORD -i database\init-kabala-pro.sql -v DatabaseName="kabalaPro" MasterEmail="maestro@kabala.local" MasterPasswordHash="$2b$..."
```

Use the SQL method only when you already have a bcrypt hash. Do not pass a plain password as `MasterPasswordHash`.

## Build production package

From the source project root:

```bat
scripts\windows\package-production.bat
```

This creates:

```bat
release\KabalaPro
```

Before compiling the installer, place `nssm.exe` in:

```bat
tools\nssm\nssm.exe
```

Then run the package script again so it is copied into `release\KabalaPro`.

## Build Inno Setup installer

Open `installer\kabala-pro-1.0.iss` with Inno Setup Compiler and compile it.

Expected output:

```bat
release\KabalaPro-1.0-Setup.exe
```

## Manual install flow

1. Run `KabalaPro-1.0-Setup.exe` as Administrator.
2. Install to `D:\KabalaPro`.
3. Create `D:\KabalaPro\backend\.env` from `D:\KabalaPro\backend\.env.example`.
4. Run `D:\KabalaPro\scripts\windows\init-database.bat`.
5. Run `D:\KabalaPro\scripts\windows\install-kabala-service.bat` as Administrator.
6. Open `http://localhost:4000`.

Do not install the service before `backend\.env` exists. The service installer validates this and stops with an error if the file is missing.

The Inno Setup draft opens this guide after installation. Database initialization, service installation, and browser opening are optional post-install actions and remain unchecked by default. Keep them unchecked until `backend\.env` has been configured.

## Validation checklist

- Files installed under `D:\KabalaPro`
- Database initialized without deleting data
- Master user exists: `maestro@kabala.local`
- Master user password is stored as bcrypt hash only
- Windows service `KabalaPro` installed
- Service start type is automatic
- Service starts successfully
- `http://localhost:4000/health` responds
- `http://localhost:4000` opens the PWA
- Login with master user
- Generate carta online
- Generate carta offline
- Patients
- Agenda
- Voice dictation
- PDF generation and `/pdfs/...` links
- Access from mobile through Tailscale
