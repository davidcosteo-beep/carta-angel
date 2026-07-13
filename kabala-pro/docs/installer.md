# Kabala Pro 1.0 - instalacion y empaquetado

## Alcance

El instalador copia Kabala Pro, incluye Node.js LTS x64 y NSSM, crea la configuracion inicial, ejecuta el inicializador idempotente y configura el servicio automatico KabalaPro en el puerto 4000.

SQL Server (MSSQLSERVER) y Tailscale son prerrequisitos manuales. El instalador no instala SQL Server ni ejecuta comandos de Tailscale.

## Carpeta seleccionable

En una instalacion limpia se muestra la pagina de destino y la carpeta es seleccionable. Se sugiere D:\KabalaPro cuando existe D; en caso contrario, C:\KabalaPro. El tecnico puede seleccionar otra carpeta local, por ejemplo E:\Aplicaciones\KabalaPro. No se aceptan rutas UNC o unidades de red.

En una actualizacion o reparacion, el AppId existente conserva la carpeta registrada y la pagina de destino se omite. El instalador vuelve a validar esa ruta y detecta backend\.env aunque la pagina se haya omitido; no permite trasladar silenciosamente la aplicacion a otra unidad o carpeta.

Toda ruta se deriva de la carpeta seleccionada:

    <carpeta>\backend\server.js
    <carpeta>\backend\node_modules\
    <carpeta>\backend\.env
    <carpeta>\dist\
    <carpeta>\database\
    <carpeta>\scripts\windows\
    <carpeta>\docs\
    <carpeta>\logs\
    <carpeta>\tools\nssm\nssm.exe

## Dependencias para compilar

Antes de compilar deben existir binarios reales en installer\dependencies\node-lts-x64.msi e installer\dependencies\nssm.exe. No se descargan ni generan automaticamente. installer\dependencies\nssm.exe es la unica fuente de NSSM; el empaquetado lo copia a release\KabalaPro\tools\nssm\nssm.exe y el instalador usa esa unica copia. La release debe contener backend\node_modules; el PC cliente no ejecuta npm install ni npm ci.

Las dependencias actuales requieren Node.js 20 o superior. El instalador analiza node --version; una version anterior no se acepta y se reemplaza mediante el MSI LTS incluido. Los codigos MSI 0, 3010 y 1641 se consideran resultados validos, pero siempre se comprueba directamente el node.exe instalado.

## Configuracion y base de datos

En una instalacion limpia se solicitan DB_SERVER, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD, TECH_EMAIL y TECH_PASSWORD. El puerto permanece en 4000. Se crea backend\.env y se genera un JWT_SECRET sin mostrar secretos en mensajes o logs.

En upgrade, reparacion o reinstalacion, backend\.env se conserva completo: JWT, SQL, SMTP y usuario tecnico no se reemplazan.

El instalador ejecuta directamente node backend\scripts\init-database.js usando los node_modules empaquetados. El inicializador crea la base o elementos faltantes y no elimina tablas ni datos. SQL Server y el usuario SQL deben estar preparados previamente.

## Servicio y salud

El unico servicio oficial es KabalaPro. Antes de copiar se detienen KabalaPro y el nombre legado KabalaProBackend. Al finalizar se elimina el legado y se recrea solo KabalaPro con inicio automatico, server.js, directorio backend y logs en logs.

El instalador comprueba http://127.0.0.1:4000/health durante hasta 30 segundos. Si no recibe ok=true y status=running, no anuncia exito y el tecnico debe revisar logs.

Antes de reemplazar una instalacion existente, el instalador respalda backend (sin .env ni logs) y dist en <carpeta>\.kabala-update-backup. Conserva una copia verificada de .env dentro de ese respaldo persistente. Si fallan la inicializacion, la creacion o inicio del servicio, o /health, restaura ese runtime y vuelve a crear/iniciar el servicio oficial KabalaPro cuando antes existia KabalaPro o el nombre legado. Cada etapa de recuperacion se intenta de forma independiente y el respaldo se conserva para recuperacion manual. Solo se elimina despues de confirmar base de datos, servicio y /health. backend\.env y logs se preservan; la recuperacion no revierte ni modifica datos SQL.

La unidad seleccionada debe existir, permitir escritura y tener al menos 2 GB libres para el paquete, sus dependencias y el respaldo temporal de actualizacion. No se aceptan rutas UNC.

## Tailscale, PWA y actualizaciones

Despues de confirmar /health, el tecnico configura manualmente Tailscale Serve para http://127.0.0.1:4000. El instalador no cambia Tailscale. Las futuras versiones se instalan solo en el PC servidor. Las PWAs reciben normalmente la nueva version desde el servidor y no necesitan reinstalarse.

## Preparacion

Desde la raiz, scripts\windows\package-production.bat genera release\KabalaPro con dist y backend\node_modules. Luego se compila installer\kabala-pro-1.0.iss con Inno Setup. El empaquetado no se ejecuta en el PC cliente.
