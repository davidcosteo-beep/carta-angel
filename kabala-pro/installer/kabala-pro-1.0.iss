#define MyAppName "Kabala Pro"
#define MyAppVersion "1.0"
#define MyAppPublisher "Kabala Pro"
#define SourceDir "..\release\KabalaPro"
#define ServiceName "KabalaPro"
#define LegacyServiceName "KabalaProBackend"

[Setup]
AppId={{D78F63BB-0B27-4A74-A3D2-56D4C1D14810}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={code:GetDefaultDirName}
DisableDirPage=auto
UsePreviousAppDir=yes
DisableProgramGroupPage=yes
OutputDir=..\release
OutputBaseFilename=KabalaPro-1.0-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible
WizardStyle=modern
SetupLogging=yes
SetupIconFile=assets\kabala-pro.ico
UninstallDisplayIcon={app}\kabala-pro.ico

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "backend\.env,logs\*"
Source: "dependencies\node-lts-x64.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall; Check: not IsNodeInstalled
Source: "assets\kabala-pro.ico"; DestDir: "{app}"; DestName: "kabala-pro.ico"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"; Flags: uninsneveruninstall

[Icons]
Name: "{autoprograms}\Kabala Pro"; Filename: "{code:GetAppURL}"; IconFilename: "{app}\kabala-pro.ico"

[Run]
Filename: "{app}\docs\installer.md"; Description: "Abrir guia de instalacion"; Flags: postinstall shellexec skipifsilent nowait
Filename: "{code:GetAppURL}"; Description: "Abrir Kabala Pro"; Flags: postinstall unchecked shellexec skipifsilent nowait

[UninstallRun]
Filename: "{app}\tools\nssm\nssm.exe"; Parameters: "stop {#ServiceName}"; Flags: runhidden waituntilterminated skipifdoesntexist; RunOnceId: "StopKabalaPro"
Filename: "{app}\tools\nssm\nssm.exe"; Parameters: "remove {#ServiceName} confirm"; Flags: runhidden waituntilterminated skipifdoesntexist; RunOnceId: "RemoveKabalaPro"
Filename: "{app}\tools\nssm\nssm.exe"; Parameters: "stop {#LegacyServiceName}"; Flags: runhidden waituntilterminated skipifdoesntexist; RunOnceId: "StopKabalaProBackend"
Filename: "{app}\tools\nssm\nssm.exe"; Parameters: "remove {#LegacyServiceName} confirm"; Flags: runhidden waituntilterminated skipifdoesntexist; RunOnceId: "RemoveKabalaProBackend"

[Code]
var
  ConfigPage: TInputQueryWizardPage;
  NodeExePath: string;
  ExistingEnv: Boolean;
  RuntimeBackupCreated: Boolean;
  PreviousOfficialServiceExisted: Boolean;
  PreviousLegacyServiceExisted: Boolean;
  PreviousOfficialServiceRunning: Boolean;
  PreviousLegacyServiceRunning: Boolean;
  PreviousInstallDir: string;
  IsUpgrade: Boolean;

const
  MinimumNodeMajor = 20;
  MinimumFreeBytes = 2147483648;

function Quote(Value: string): string;
begin
  Result := '"' + Value + '"';
end;

function GetDefaultDirName(Param: string): string;
begin
  if DirExists('D:\') then Result := 'D:\KabalaPro'
  else Result := 'C:\KabalaPro';
end;

function GetRegisteredInstallDir(): string;
var UninstallKey: string;
begin
  Result := '';
  UninstallKey := 'Software\Microsoft\Windows\CurrentVersion\Uninstall\{D78F63BB-0B27-4A74-A3D2-56D4C1D14810}_is1';
  if RegQueryStringValue(HKLM64, UninstallKey, 'InstallLocation', Result) then Exit;
  if RegQueryStringValue(HKCU64, UninstallKey, 'InstallLocation', Result) then Exit;
  if RegQueryStringValue(HKLM32, UninstallKey, 'InstallLocation', Result) then Exit;
  RegQueryStringValue(HKCU32, UninstallKey, 'InstallLocation', Result);
end;

function GetNodeX64Path(): string;
begin
  Result := ExpandConstant('{pf}\nodejs\node.exe');
end;

function GetNodeX86Path(): string;
begin
  Result := ExpandConstant('{pf32}\nodejs\node.exe');
end;

function GetNodeMajor(Path: string): Integer;
var ResultCode, DotPos: Integer; VersionPath: string; VersionData: AnsiString; VersionText: string;
begin
  Result := 0;
  if not FileExists(Path) then Exit;
  VersionPath := ExpandConstant('{tmp}\kabala-node-version.txt');
  try
    DeleteFile(VersionPath);
    if not Exec(ExpandConstant('{cmd}'), '/D /S /C ""' + Path +
      '" --version > "' + VersionPath + '" 2>&1"', '', SW_HIDE,
      ewWaitUntilTerminated, ResultCode) or (ResultCode <> 0) or
      (not LoadStringFromFile(VersionPath, VersionData)) then Exit;
    VersionText := Trim(String(VersionData));
    if (Length(VersionText) > 1) and (VersionText[1] = 'v') then
      Delete(VersionText, 1, 1);
    DotPos := Pos('.', VersionText);
    if DotPos > 1 then Result := StrToIntDef(Copy(VersionText, 1, DotPos - 1), 0);
  finally
    DeleteFile(VersionPath);
  end;
end;

function IsUsableNode(Path: string): Boolean;
begin
  Result := GetNodeMajor(Path) >= MinimumNodeMajor;
end;

function ResolveNodePath(): string;
var PathResult: string;
begin
  Result := '';
  if IsUsableNode(GetNodeX64Path()) then Result := GetNodeX64Path()
  else if IsUsableNode(GetNodeX86Path()) then Result := GetNodeX86Path()
  else begin
    PathResult := FileSearch('node.exe', GetEnv('PATH'));
    if IsUsableNode(PathResult) then Result := PathResult;
  end;
end;

function IsNodeInstalled(): Boolean;
begin
  Result := ResolveNodePath() <> '';
end;

function GenerateSecret(): string;
var
  ResultCode: Integer;
  SecretPath, PowerShellPath, Params: string;
  SecretData: AnsiString;
begin
  SecretPath := ExpandConstant('{tmp}\kabala-jwt-secret.txt');
  PowerShellPath := ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe');
  Params := '-NoLogo -NoProfile -NonInteractive -Command "' +
    '$rng=[Security.Cryptography.RandomNumberGenerator]::Create();' +
    '$bytes=New-Object byte[] 64;' +
    '$rng.GetBytes($bytes);' +
    '[Convert]::ToBase64String($bytes) | Set-Content -NoNewline -Encoding ASCII ''' +
    SecretPath + '''"';
  try
    if not Exec(PowerShellPath, Params, '', SW_HIDE, ewWaitUntilTerminated,
      ResultCode) or (ResultCode <> 0) or
      (not LoadStringFromFile(SecretPath, SecretData)) or
      (Length(SecretData) < 64) then
      RaiseException('No se pudo generar JWT_SECRET de forma segura.');
    Result := String(SecretData);
  finally
    DeleteFile(SecretPath);
  end;
end;

function GetAppURL(Param: string): string;
begin
  Result := 'http://127.0.0.1:4000';
end;

procedure InitializeWizard;
begin
  PreviousInstallDir := RemoveBackslashUnlessRoot(GetRegisteredInstallDir());
  IsUpgrade := PreviousInstallDir <> '';
  if IsUpgrade then begin
    WizardForm.DirEdit.Text := PreviousInstallDir;
    ExistingEnv := FileExists(AddBackslash(PreviousInstallDir) + 'backend\.env');
    Log('Existing Kabala Pro installation detected at: ' + PreviousInstallDir);
    if ExistingEnv then
      Log('Existing backend environment detected before page navigation; it will be preserved.');
  end;
  ConfigPage := CreateInputQueryPage(wpSelectDir,
    'Configuracion inicial de Kabala Pro',
    'Configura SQL Server, el puerto y el usuario tecnico',
    'En una actualizacion se conserva backend\.env y esta pagina se omite.');
  ConfigPage.Add('DB_SERVER:', False);
  ConfigPage.Add('DB_PORT:', False);
  ConfigPage.Add('DB_DATABASE:', False);
  ConfigPage.Add('DB_USER:', False);
  ConfigPage.Add('DB_PASSWORD:', True);
  ConfigPage.Add('PORT:', False);
  ConfigPage.Add('Correo del usuario tecnico:', False);
  ConfigPage.Add('Contrasena del usuario tecnico:', True);
  ConfigPage.Add('Confirmar contrasena tecnica:', True);
  ConfigPage.Values[0] := 'localhost';
  ConfigPage.Values[1] := '1433';
  ConfigPage.Values[2] := 'kabalaPro';
  ConfigPage.Values[3] := 'kabala_app';
  ConfigPage.Values[5] := '4000';
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := (PageID = ConfigPage.ID) and ExistingEnv;
end;

function IsBasicEmail(Value: string): Boolean;
var
  AtPos, RelativeDotPos, DotPos: Integer;
begin
  AtPos := Pos('@', Value);
  DotPos := 0;

  if AtPos > 0 then begin
    RelativeDotPos := Pos('.', Copy(Value, AtPos + 1, Length(Value)));
    if RelativeDotPos > 0 then
      DotPos := AtPos + RelativeDotPos;
  end;

  Result :=
    (AtPos > 1) and
    (DotPos > AtPos + 1) and
    (DotPos < Length(Value));
end;

function ContainsLineBreak(Value: string): Boolean;
begin
  Result := (Pos(#13, Value) > 0) or (Pos(#10, Value) > 0);
end;

function CanSerializeDotEnvValue(Value: string): Boolean;
begin
  Result := not ContainsLineBreak(Value) and
    ((Pos('"', Value) = 0) or (Pos('''', Value) = 0) or (Pos('`', Value) = 0));
end;

function SerializeDotEnvValue(Value: string): string;
begin
  if ContainsLineBreak(Value) then
    RaiseException('No se pueden serializar saltos de linea en backend\.env.');
  if Pos('"', Value) = 0 then Result := '"' + Value + '"'
  else if Pos('''', Value) = 0 then Result := '''' + Value + ''''
  else if Pos('`', Value) = 0 then Result := '`' + Value + '`'
  else RaiseException('Un valor de configuracion contiene comillas dobles, simples y acentos graves; no puede guardarse de forma segura.');
end;

function ValidateInstallPath(PathValue: string): Boolean;
var DriveRoot, TestFile: string; FreeBytes, TotalBytes: Int64;
begin
  Result := False;
  if (Copy(PathValue, 1, 2) = '\\') or (Copy(PathValue, 1, 2) = '//') then begin
    MsgBox('Selecciona una carpeta en una unidad local. No se permiten rutas UNC o de red.', mbError, MB_OK);
    Exit;
  end;
  DriveRoot := ExtractFileDrive(PathValue) + '\';
  if (ExtractFileDrive(PathValue) = '') or (not DirExists(DriveRoot)) then begin
    MsgBox('La unidad seleccionada no existe.', mbError, MB_OK);
    Exit;
  end;
  if not GetSpaceOnDisk64(DriveRoot, FreeBytes, TotalBytes) then begin
    MsgBox('No se pudo comprobar el espacio libre de la unidad seleccionada.', mbError, MB_OK);
    Exit;
  end;
  if FreeBytes < MinimumFreeBytes then begin
    MsgBox('Se requieren al menos 2 GB libres para la aplicacion, sus dependencias y el respaldo de actualizacion.', mbError, MB_OK);
    Exit;
  end;
  if not ForceDirectories(PathValue) then begin
    MsgBox('No se pudo crear o abrir la carpeta seleccionada.', mbError, MB_OK);
    Exit;
  end;
  TestFile := AddBackslash(PathValue) + 'kabala-pro-write-test.tmp';
  if not SaveStringToFile(TestFile, 'write-test', False) then begin
    MsgBox('El instalador no tiene permisos de escritura en la carpeta seleccionada.', mbError, MB_OK);
    Exit;
  end;
  DeleteFile(TestFile);
  Result := True;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if CurPageID = wpSelectDir then begin
    Result := ValidateInstallPath(WizardDirValue());
    if Result then begin
      ExistingEnv := FileExists(AddBackslash(WizardDirValue()) + 'backend\.env');
      if ExistingEnv then
        Log('Existing backend environment detected; configuration and secrets will be preserved.');
    end;
  end else if CurPageID = ConfigPage.ID then begin
    if ContainsLineBreak(ConfigPage.Values[0]) or ContainsLineBreak(ConfigPage.Values[1]) or
       ContainsLineBreak(ConfigPage.Values[2]) or ContainsLineBreak(ConfigPage.Values[3]) or
       ContainsLineBreak(ConfigPage.Values[4]) or ContainsLineBreak(ConfigPage.Values[5]) or
       ContainsLineBreak(ConfigPage.Values[6]) or ContainsLineBreak(ConfigPage.Values[7]) or
       ContainsLineBreak(ConfigPage.Values[8]) then begin
      MsgBox('Los campos de configuracion no pueden contener saltos de linea.', mbError, MB_OK); Result := False;
    end else if (not CanSerializeDotEnvValue(ConfigPage.Values[0])) or
       (not CanSerializeDotEnvValue(ConfigPage.Values[1])) or
       (not CanSerializeDotEnvValue(ConfigPage.Values[2])) or
       (not CanSerializeDotEnvValue(ConfigPage.Values[3])) or
       (not CanSerializeDotEnvValue(ConfigPage.Values[4])) or
       (not CanSerializeDotEnvValue(ConfigPage.Values[6])) or
       (not CanSerializeDotEnvValue(ConfigPage.Values[7])) then begin
      MsgBox('Un campo contiene comillas dobles, simples y acentos graves. Cambia al menos uno de esos caracteres para poder guardarlo sin alterar su valor.', mbError, MB_OK); Result := False;
    end else if Trim(ConfigPage.Values[0]) = '' then begin MsgBox('DB_SERVER es obligatorio.', mbError, MB_OK); Result := False; end
    else if Trim(ConfigPage.Values[1]) = '' then begin MsgBox('DB_PORT es obligatorio.', mbError, MB_OK); Result := False; end
    else if Trim(ConfigPage.Values[2]) = '' then begin MsgBox('DB_DATABASE es obligatorio.', mbError, MB_OK); Result := False; end
    else if Trim(ConfigPage.Values[3]) = '' then begin MsgBox('DB_USER es obligatorio.', mbError, MB_OK); Result := False; end
    else if ConfigPage.Values[4] = '' then begin MsgBox('DB_PASSWORD es obligatorio.', mbError, MB_OK); Result := False; end
    else if Trim(ConfigPage.Values[5]) <> '4000' then begin MsgBox('Kabala Pro 1.0 debe usar el puerto 4000.', mbError, MB_OK); Result := False; end
    else if not IsBasicEmail(Trim(ConfigPage.Values[6])) then begin MsgBox('Ingresa un correo tecnico valido.', mbError, MB_OK); Result := False; end
    else if ConfigPage.Values[7] = '' then begin MsgBox('La contrasena tecnica es obligatoria.', mbError, MB_OK); Result := False; end
    else if ConfigPage.Values[7] <> ConfigPage.Values[8] then begin MsgBox('Las contrasenas tecnicas no coinciden.', mbError, MB_OK); Result := False; end;
  end;
end;

function QueryServiceStateContains(ServiceName, ExpectedState: string): Boolean;
var ResultCode: Integer; StatePath: string; StateData: AnsiString;
begin
  Result := False;
  StatePath := ExpandConstant('{tmp}\kabala-service-query.txt');
  try
    DeleteFile(StatePath);
    if Exec(ExpandConstant('{cmd}'), '/D /S /C ""' + ExpandConstant('{sys}\sc.exe') +
      '" query ' + ServiceName + ' > "' + StatePath + '" 2>&1"', '', SW_HIDE,
      ewWaitUntilTerminated, ResultCode) and (ResultCode = 0) and
      LoadStringFromFile(StatePath, StateData) then
      Result := Pos(ExpectedState, Uppercase(String(StateData))) > 0;
  finally
    DeleteFile(StatePath);
  end;
end;

function IsServiceRunning(ServiceName: string): Boolean;
begin
  Result := QueryServiceStateContains(ServiceName, 'RUNNING');
end;

function WaitForServiceRunning(ServiceName: string; TimeoutSeconds: Integer): Boolean;
var Attempt: Integer;
begin
  for Attempt := 1 to TimeoutSeconds * 2 do begin
    if IsServiceRunning(ServiceName) then begin Result := True; Exit; end;
    Sleep(500);
  end;
  Result := False;
end;

procedure RestartServiceAfterPreparationFailure(ServiceName: string; WasRunning: Boolean);
var ResultCode: Integer;
begin
  if not WasRunning then begin
    Log('Pre-copy recovery: ' + ServiceName + ' was previously stopped; it will remain stopped.');
    Exit;
  end;
  try
    if IsServiceRunning(ServiceName) then begin
      Log('Pre-copy recovery: ' + ServiceName + ' is already running.');
      Exit;
    end;
    if not Exec(ExpandConstant('{sys}\sc.exe'), 'start ' + ServiceName, '', SW_HIDE,
      ewWaitUntilTerminated, ResultCode) then begin
      Log('Pre-copy recovery: sc.exe could not be executed for ' + ServiceName + '.');
      Exit;
    end;
    if WaitForServiceRunning(ServiceName, 30) then
      Log('Pre-copy recovery: ' + ServiceName + ' restarted successfully.')
    else
      Log('Pre-copy recovery: ' + ServiceName + ' did not reach RUNNING within 30 seconds; sc.exe result was ' + IntToStr(ResultCode) + '.');
  except
    Log('Pre-copy recovery: restart failed for ' + ServiceName + ': ' + GetExceptionMessage());
  end;
end;

function ServiceExists(ServiceName: string): Boolean;
var ResultCode: Integer;
begin
  Exec(ExpandConstant('{sys}\sc.exe'), 'query ' + ServiceName, '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode);
  Result := ResultCode = 0;
end;

function WaitForServiceAbsent(ServiceName: string; TimeoutSeconds: Integer): Boolean;
var Attempt: Integer;
begin
  for Attempt := 1 to TimeoutSeconds * 2 do begin
    if not ServiceExists(ServiceName) then begin Result := True; Exit; end;
    Sleep(500);
  end;
  Result := False;
end;

function WaitForServiceStopped(ServiceName: string; TimeoutSeconds: Integer): Boolean;
var Attempt, ResultCode: Integer; StatePath: string; StateData: AnsiString;
begin
  Result := False;
  StatePath := ExpandConstant('{tmp}\kabala-service-state.txt');
  try
    for Attempt := 1 to TimeoutSeconds * 2 do begin
      if not ServiceExists(ServiceName) then begin Result := True; Exit; end;
      DeleteFile(StatePath);
      Exec(ExpandConstant('{cmd}'), '/D /S /C ""' + ExpandConstant('{sys}\sc.exe') +
        '" query ' + ServiceName + ' > "' + StatePath + '" 2>&1"', '', SW_HIDE,
        ewWaitUntilTerminated, ResultCode);
      if LoadStringFromFile(StatePath, StateData) and
         (Pos('STOPPED', Uppercase(String(StateData))) > 0) then begin Result := True; Exit; end;
      Sleep(500);
    end;
  finally
    DeleteFile(StatePath);
  end;
end;

procedure StopServiceBeforeCopy(ServiceName: string);
var ResultCode: Integer;
begin
  if not ServiceExists(ServiceName) then Exit;
  Exec(ExpandConstant('{sys}\sc.exe'), 'stop ' + ServiceName, '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode);
  if not WaitForServiceStopped(ServiceName, 30) then
    RaiseException('No se pudo detener el servicio ' + ServiceName + ' dentro de 30 segundos. No se reemplazaron archivos.');
end;

procedure InstallBundledNodeIfNeeded;
var ResultCode: Integer; NodeMsiPath: string;
begin
  NodeExePath := ResolveNodePath();
  if NodeExePath <> '' then begin
    Log('Using detected Node.js executable: ' + NodeExePath);
    Exit;
  end;
  NodeMsiPath := ExpandConstant('{tmp}\node-lts-x64.msi');
  if not FileExists(NodeMsiPath) then
    RaiseException('No se encontro el MSI de Node.js LTS incluido en el instalador.');
  if not Exec(ExpandConstant('{sys}\msiexec.exe'),
    '/i ' + Quote(NodeMsiPath) + ' /quiet /norestart', '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode) or
    ((ResultCode <> 0) and (ResultCode <> 3010) and (ResultCode <> 1641)) then
    RaiseException('No se pudo instalar Node.js LTS. Revisa el log del instalador.');
  NodeExePath := GetNodeX64Path();
  if not IsUsableNode(NodeExePath) then
    RaiseException('El MSI termino, pero node.exe no existe o no cumple Node.js 20 o superior.');
  Log('Using newly installed Node.js executable: ' + NodeExePath);
end;

procedure VerifyReleaseLayout;
begin
  if not FileExists(ExpandConstant('{app}\backend\server.js')) then RaiseException('No se encontro backend\server.js.');
  if not DirExists(ExpandConstant('{app}\backend\node_modules')) then RaiseException('No se encontro backend\node_modules.');
  if not FileExists(ExpandConstant('{app}\dist\index.html')) then RaiseException('No se encontro dist\index.html.');
  if not FileExists(ExpandConstant('{app}\tools\nssm\nssm.exe')) then RaiseException('No se encontro tools\nssm\nssm.exe.');
end;

procedure WriteBackendEnvIfMissing;
var EnvPath, EnvText: string;
begin
  EnvPath := ExpandConstant('{app}\backend\.env');
  if FileExists(EnvPath) then begin
    Log('Preserving existing backend environment file.');
    Exit;
  end;
  EnvText :=
    'PORT=4000' + #13#10 +
    'DB_SERVER=' + SerializeDotEnvValue(Trim(ConfigPage.Values[0])) + #13#10 +
    'DB_PORT=' + SerializeDotEnvValue(Trim(ConfigPage.Values[1])) + #13#10 +
    'DB_DATABASE=' + SerializeDotEnvValue(Trim(ConfigPage.Values[2])) + #13#10 +
    'DB_USER=' + SerializeDotEnvValue(Trim(ConfigPage.Values[3])) + #13#10 +
    'DB_PASSWORD=' + SerializeDotEnvValue(ConfigPage.Values[4]) + #13#10 +
    'TECH_EMAIL=' + SerializeDotEnvValue(Trim(ConfigPage.Values[6])) + #13#10 +
    'TECH_PASSWORD=' + SerializeDotEnvValue(ConfigPage.Values[7]) + #13#10 +
    'JWT_SECRET=' + GenerateSecret() + #13#10 +
    'NODE_ENV=production' + #13#10;
  if not SaveStringToFile(EnvPath, EnvText, False) then
    RaiseException('No se pudo crear backend\.env. No se registraron sus valores secretos.');
end;

procedure InitializeDatabase;
var ResultCode: Integer; Params, DiagnosticPath: string;
begin
  Log('Running the idempotent Kabala Pro database initializer.');
  DiagnosticPath := ExpandConstant('{app}\logs\database-init.log');
  Params := '/D /S /C ""' + NodeExePath + '" scripts\init-database.js >> "' +
    DiagnosticPath + '" 2>&1"';
  if not Exec(ExpandConstant('{cmd}'), Params,
    ExpandConstant('{app}\backend'), SW_HIDE, ewWaitUntilTerminated, ResultCode) or
    (ResultCode <> 0) then
    RaiseException('La inicializacion de la base de datos fallo. Revisa logs\database-init.log.');
end;

function ExecNssm(Params: string; AllowFailure: Boolean): Boolean;
var ResultCode: Integer;
begin
  Result := Exec(ExpandConstant('{app}\tools\nssm\nssm.exe'), Params, '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode);
  if ((not Result) or (ResultCode <> 0)) and (not AllowFailure) then
    RaiseException('NSSM no pudo configurar el servicio. Revisa el log del instalador.');
end;

procedure RemoveServiceIfPresent(ServiceName: string);
begin
  if ServiceExists(ServiceName) then begin
    StopServiceBeforeCopy(ServiceName);
    ExecNssm('remove ' + ServiceName + ' confirm', False);
    if not WaitForServiceAbsent(ServiceName, 30) then
      RaiseException('El servicio ' + ServiceName + ' sigue marcado para eliminacion despues de 30 segundos.');
  end;
end;

procedure RecreateBackendService;
var BackendPath, LogPath: string;
begin
  BackendPath := ExpandConstant('{app}\backend');
  LogPath := ExpandConstant('{app}\logs');
  ForceDirectories(LogPath);
  RemoveServiceIfPresent('{#LegacyServiceName}');
  RemoveServiceIfPresent('{#ServiceName}');
  ExecNssm('install {#ServiceName} ' + Quote(NodeExePath) + ' "server.js"', False);
  ExecNssm('set {#ServiceName} AppDirectory ' + Quote(BackendPath), False);
  ExecNssm('set {#ServiceName} DisplayName "Kabala Pro"', False);
  ExecNssm('set {#ServiceName} Description "Kabala Pro local production service"', False);
  ExecNssm('set {#ServiceName} Start SERVICE_AUTO_START', False);
  ExecNssm('set {#ServiceName} AppStdout ' + Quote(LogPath + '\backend-out.log'), False);
  ExecNssm('set {#ServiceName} AppStderr ' + Quote(LogPath + '\backend-error.log'), False);
  ExecNssm('set {#ServiceName} AppRotateFiles 1', False);
  ExecNssm('set {#ServiceName} AppRotateOnline 1', False);
  ExecNssm('set {#ServiceName} AppRotateBytes 1048576', False);
  ExecNssm('start {#ServiceName}', False);
end;

function IsHealthy: Boolean;
var Http: Variant; Body: string;
begin
  Result := False;
  try
    Http := CreateOleObject('WinHttp.WinHttpRequest.5.1');
    Http.SetTimeouts(3000, 3000, 3000, 3000);
    Http.Open('GET', 'http://127.0.0.1:4000/health', False);
    Http.Send('');
    Body := Http.ResponseText;
    Result := (Http.Status = 200) and (Pos('"ok":true', Body) > 0) and
      (Pos('"status":"running"', Body) > 0);
  except
    Result := False;
  end;
end;

procedure VerifyHealth;
var Attempt: Integer;
begin
  for Attempt := 1 to 15 do begin
    if IsHealthy then begin Log('Kabala Pro health verification succeeded.'); Exit; end;
    Sleep(2000);
  end;
  RaiseException('Kabala Pro no respondio correctamente en http://127.0.0.1:4000/health. Revisa la carpeta logs.');
end;

function RunRobocopy(SourceDir, DestDir, ExtraParams: string): Boolean;
var ResultCode: Integer;
begin
  Result := Exec(ExpandConstant('{sys}\robocopy.exe'), Quote(SourceDir) + ' ' +
    Quote(DestDir) + ' /E /R:1 /W:1 ' + ExtraParams, '', SW_HIDE,
    ewWaitUntilTerminated, ResultCode) and (ResultCode < 8);
end;

procedure CreateRuntimeBackup;
var BackupRoot, MarkerPath, EnvPath, PreservedEnvPath: string; MarkerData: AnsiString;
begin
  RuntimeBackupCreated := False;
  if not DirExists(ExpandConstant('{app}\backend')) and
     not DirExists(ExpandConstant('{app}\dist')) then Exit;
  BackupRoot := ExpandConstant('{app}\.kabala-update-backup');
  MarkerPath := BackupRoot + '\kabala-update-backup.marker';
  EnvPath := ExpandConstant('{app}\backend\.env');
  PreservedEnvPath := BackupRoot + '\preserved-backend.env';
  if DirExists(BackupRoot) then begin
    if (not LoadStringFromFile(MarkerPath, MarkerData)) or
       (Trim(String(MarkerData)) <> 'KabalaProRuntimeBackupV1') then
      RaiseException('Existe .kabala-update-backup sin un marcador valido. No se eliminara; revisala manualmente.');
    if not DelTree(BackupRoot, True, True, True) then
      RaiseException('No se pudo eliminar el respaldo anterior reconocido de Kabala Pro.');
  end;
  if not ForceDirectories(BackupRoot) or
     not SaveStringToFile(MarkerPath, 'KabalaProRuntimeBackupV1', False) then
    RaiseException('No se pudo crear el respaldo persistente de actualizacion.');
  if DirExists(ExpandConstant('{app}\backend')) and
     not RunRobocopy(ExpandConstant('{app}\backend'), BackupRoot + '\backend',
       '/XF .env /XD logs') then
    RaiseException('No se pudo respaldar el runtime backend; la actualizacion fue cancelada antes de copiar.');
  if DirExists(ExpandConstant('{app}\dist')) and
     not RunRobocopy(ExpandConstant('{app}\dist'), BackupRoot + '\dist', '') then
    RaiseException('No se pudo respaldar dist; la actualizacion fue cancelada antes de copiar.');
  if FileExists(EnvPath) then begin
    if not CopyFile(EnvPath, PreservedEnvPath, False) or
       not FileExists(PreservedEnvPath) then
      RaiseException('No se pudo conservar una copia verificada de backend\.env; la actualizacion fue cancelada.');
  end;
  RuntimeBackupCreated := True;
  Log('Previous runtime backup completed at: ' + BackupRoot);
end;

procedure RestorePreviousRuntime;
var BackupRoot, EnvPath, PreservedEnvPath: string;
begin
  if not RuntimeBackupCreated then Exit;
  BackupRoot := ExpandConstant('{app}\.kabala-update-backup');
  EnvPath := ExpandConstant('{app}\backend\.env');
  PreservedEnvPath := BackupRoot + '\preserved-backend.env';
  if FileExists(EnvPath) and not FileExists(PreservedEnvPath) then begin
    if not CopyFile(EnvPath, PreservedEnvPath, False) or
       not FileExists(PreservedEnvPath) then
      RaiseException('No se pudo verificar la copia preservada de backend\.env; no se eliminara el backend actual.');
  end;
  if FileExists(EnvPath) and not FileExists(PreservedEnvPath) then
    RaiseException('No existe una copia preservada de backend\.env; no se eliminara el backend actual.');
  if not DelTree(ExpandConstant('{app}\backend'), True, True, True) then
    RaiseException('No se pudo retirar el backend fallido antes de restaurar el runtime anterior.');
  if not DelTree(ExpandConstant('{app}\dist'), True, True, True) then
    RaiseException('No se pudo retirar dist fallido antes de restaurar el runtime anterior.');
  if DirExists(BackupRoot + '\backend') and
     not RunRobocopy(BackupRoot + '\backend', ExpandConstant('{app}\backend'), '') then
    RaiseException('No se pudo restaurar el runtime backend anterior.');
  if DirExists(BackupRoot + '\dist') and
     not RunRobocopy(BackupRoot + '\dist', ExpandConstant('{app}\dist'), '') then
    RaiseException('No se pudo restaurar dist anterior.');
  if FileExists(PreservedEnvPath) and
     (not CopyFile(PreservedEnvPath, EnvPath, False) or not FileExists(EnvPath)) then
    RaiseException('El runtime se restauro, pero backend\.env debe recuperarse manualmente desde .kabala-update-backup\preserved-backend.env.');
end;

procedure DeleteRuntimeBackupAfterSuccess;
var BackupRoot, MarkerPath: string; MarkerData: AnsiString;
begin
  if not RuntimeBackupCreated then Exit;
  BackupRoot := ExpandConstant('{app}\.kabala-update-backup');
  MarkerPath := BackupRoot + '\kabala-update-backup.marker';
  if (not LoadStringFromFile(MarkerPath, MarkerData)) or
     (Trim(String(MarkerData)) <> 'KabalaProRuntimeBackupV1') then begin
    Log('Successful installation confirmed, but the backup marker is invalid; the backup was preserved at: ' + BackupRoot);
    Exit;
  end;
  if not DelTree(BackupRoot, True, True, True) then begin
    Log('Successful installation confirmed, but the runtime backup could not be deleted and remains at: ' + BackupRoot);
    Exit;
  end;
  RuntimeBackupCreated := False;
  Log('Successful installation confirmed; runtime backup deleted from: ' + BackupRoot);
end;

procedure RecoveryStopAndDeleteService(ServiceName: string);
var ResultCode: Integer; NssmPath: string;
begin
  Log('Recovery service cleanup started for ' + ServiceName + '.');
  try
    if not ServiceExists(ServiceName) then begin
      Log('Recovery service cleanup: ' + ServiceName + ' is absent.');
      Exit;
    end;
    Exec(ExpandConstant('{sys}\sc.exe'), 'stop ' + ServiceName, '', SW_HIDE,
      ewWaitUntilTerminated, ResultCode);
    WaitForServiceStopped(ServiceName, 15);
    NssmPath := ExpandConstant('{app}\tools\nssm\nssm.exe');
    if FileExists(NssmPath) then
      Exec(NssmPath, 'remove ' + ServiceName + ' confirm', '', SW_HIDE,
        ewWaitUntilTerminated, ResultCode);
    if ServiceExists(ServiceName) then
      Exec(ExpandConstant('{sys}\sc.exe'), 'delete ' + ServiceName, '', SW_HIDE,
        ewWaitUntilTerminated, ResultCode);
    if WaitForServiceAbsent(ServiceName, 15) then
      Log('Recovery service cleanup succeeded for ' + ServiceName + '.')
    else
      Log('Recovery service cleanup incomplete for ' + ServiceName + '; runtime restoration will still be attempted.');
  except
    Log('Recovery service cleanup failed for ' + ServiceName + ': ' + GetExceptionMessage());
  end;
end;

procedure RecoverUpgrade;
var ShouldRestoreService: Boolean;
begin
  Log('Post-install validation failed; starting staged runtime recovery.');
  ShouldRestoreService := PreviousOfficialServiceExisted or PreviousLegacyServiceExisted;
  RecoveryStopAndDeleteService('{#ServiceName}');
  RecoveryStopAndDeleteService('{#LegacyServiceName}');
  try
    RestorePreviousRuntime();
    Log('Recovery runtime restoration stage succeeded.');
  except
    Log('Recovery runtime restoration stage failed: ' + GetExceptionMessage());
  end;
  try
    if ShouldRestoreService then begin
      if NodeExePath = '' then NodeExePath := ResolveNodePath();
      if (NodeExePath <> '') and FileExists(ExpandConstant('{app}\backend\server.js')) and
         FileExists(ExpandConstant('{app}\tools\nssm\nssm.exe')) then begin
        RecreateBackendService();
        Log('Recovery service recreation stage succeeded for official KabalaPro.');
      end else
        Log('Recovery service recreation stage could not run: Node.js, backend runtime, or NSSM is unavailable.');
    end else
      Log('Recovery service recreation stage skipped because neither service existed before installation.');
  except
    Log('Recovery service recreation stage failed: ' + GetExceptionMessage());
  end;
  Log('Staged recovery finished. The persistent backup was retained; SQL data was not changed by recovery.');
end;

procedure CurStepChanged(CurStep: TSetupStep);
var FailureMessage: string;
begin
  if CurStep = ssInstall then begin
    PreviousOfficialServiceExisted := ServiceExists('{#ServiceName}');
    PreviousLegacyServiceExisted := ServiceExists('{#LegacyServiceName}');
    PreviousOfficialServiceRunning := PreviousOfficialServiceExisted and IsServiceRunning('{#ServiceName}');
    PreviousLegacyServiceRunning := PreviousLegacyServiceExisted and IsServiceRunning('{#LegacyServiceName}');
    try
      if IsUpgrade and
         (Uppercase(RemoveBackslashUnlessRoot(WizardDirValue())) <>
          Uppercase(RemoveBackslashUnlessRoot(PreviousInstallDir))) then
        RaiseException('La actualizacion debe conservar la carpeta registrada: ' + PreviousInstallDir);
      ExistingEnv := FileExists(AddBackslash(WizardDirValue()) + 'backend\.env');
      if ExistingEnv then
        Log('Pre-copy validation confirmed the existing backend environment; it will be preserved.');
      if not ValidateInstallPath(WizardDirValue()) then
        RaiseException('La preparacion se cancelo porque la carpeta de instalacion no supero la validacion.');
      StopServiceBeforeCopy('{#ServiceName}');
      StopServiceBeforeCopy('{#LegacyServiceName}');
      CreateRuntimeBackup();
    except
      FailureMessage := GetExceptionMessage();
      Log('Pre-copy preparation failed before application files were replaced: ' + FailureMessage);
      RestartServiceAfterPreparationFailure('{#ServiceName}', PreviousOfficialServiceRunning);
      RestartServiceAfterPreparationFailure('{#LegacyServiceName}', PreviousLegacyServiceRunning);
      RaiseException(FailureMessage);
    end;
  end else if CurStep = ssPostInstall then begin
    try
      InstallBundledNodeIfNeeded();
      VerifyReleaseLayout();
      WriteBackendEnvIfMissing();
      if not FileExists(ExpandConstant('{app}\backend\.env')) then RaiseException('No se encontro backend\.env.');
      InitializeDatabase();
      RecreateBackendService();
      VerifyHealth();
      DeleteRuntimeBackupAfterSuccess();
    except
      FailureMessage := GetExceptionMessage();
      RecoverUpgrade();
      RaiseException(FailureMessage);
    end;
  end;
end;
