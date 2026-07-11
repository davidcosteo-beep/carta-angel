#define MyAppName "Kabala Pro"
#define MyAppVersion "1.0"
#define MyAppPublisher "Kabala Pro"
#define MyAppURL "http://localhost:4000"
#define SourceDir "..\release\KabalaPro"
#define ServiceName "KabalaProBackend"

[Setup]
AppId={{D78F63BB-0B27-4A74-A3D2-56D4C1D14810}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName=D:\KabalaPro
DisableDirPage=no
DisableProgramGroupPage=yes
OutputDir=..\release
OutputBaseFilename=KabalaPro-1.0-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "dependencies\node-lts-x64.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall; Check: not IsNodeInstalled
Source: "dependencies\nssm.exe"; DestDir: "{app}\tools"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\Kabala Pro"; Filename: "{code:GetAppURL}"

[Run]
Filename: "{app}\docs\installer.md"; Description: "Abrir guia de instalacion"; Flags: postinstall shellexec skipifsilent nowait
Filename: "{code:GetAppURL}"; Description: "Abrir Kabala Pro"; Flags: postinstall unchecked shellexec skipifsilent nowait

[UninstallRun]
Filename: "{app}\tools\nssm.exe"; Parameters: "stop {#ServiceName}"; Flags: runhidden waituntilterminated
Filename: "{app}\tools\nssm.exe"; Parameters: "remove {#ServiceName} confirm"; Flags: runhidden waituntilterminated

[Code]
var
  DbPage: TInputQueryWizardPage;
  NodeExePath: string;

function Quote(Value: string): string;
begin
  Result := '"' + Value + '"';
end;

function GetNodeX64Path(): string;
begin
  Result := ExpandConstant('{pf}\nodejs\node.exe');
end;

function GetNodeX86Path(): string;
begin
  Result := ExpandConstant('{pf32}\nodejs\node.exe');
end;

function IsNodeInstalled(): Boolean;
begin
  Result :=
    FileExists(GetNodeX64Path()) or
    FileExists(GetNodeX86Path());
end;

function ResolveNodePath(): string;
begin
  if FileExists(GetNodeX64Path()) then begin
    Result := GetNodeX64Path();
  end else if FileExists(GetNodeX86Path()) then begin
    Result := GetNodeX86Path();
  end else begin
    Result := '';
  end;
end;

function GenerateSecret(): string;
var
  I: Integer;
  Alphabet: string;
begin
  Alphabet := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  Result := '';

  for I := 1 to 64 do begin
    Result := Result + Copy(Alphabet, Random(Length(Alphabet)) + 1, 1);
  end;
end;

function GetAppURL(Param: string): string;
var
  PortValue: string;
begin
  PortValue := '4000';

  if DbPage <> nil then begin
    PortValue := DbPage.Values[5];
  end;

  Result := 'http://localhost:' + PortValue;
end;

procedure InitializeWizard;
begin
  DbPage :=
    CreateInputQueryPage(
      wpSelectDir,
      'Configuracion de Kabala Pro',
      'Configura la base de datos y el puerto local',
      'Estos valores se guardaran en el archivo backend\.env de la instalacion.'
    );

  DbPage.Add('DB_SERVER:', False);
  DbPage.Add('DB_PORT:', False);
  DbPage.Add('DB_DATABASE:', False);
  DbPage.Add('DB_USER:', False);
  DbPage.Add('DB_PASSWORD:', True);
  DbPage.Add('PORT:', False);

  DbPage.Values[0] := 'localhost';
  DbPage.Values[1] := '1433';
  DbPage.Values[2] := 'kabalaPro';
  DbPage.Values[3] := 'kabala_app';
  DbPage.Values[5] := '4000';
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;

  if CurPageID = DbPage.ID then begin
    if Trim(DbPage.Values[0]) = '' then begin
      MsgBox('DB_SERVER es obligatorio.', mbError, MB_OK);
      Result := False;
    end else if Trim(DbPage.Values[1]) = '' then begin
      MsgBox('DB_PORT es obligatorio.', mbError, MB_OK);
      Result := False;
    end else if Trim(DbPage.Values[2]) = '' then begin
      MsgBox('DB_DATABASE es obligatorio.', mbError, MB_OK);
      Result := False;
    end else if Trim(DbPage.Values[3]) = '' then begin
      MsgBox('DB_USER es obligatorio.', mbError, MB_OK);
      Result := False;
    end else if Trim(DbPage.Values[5]) = '' then begin
      MsgBox('PORT es obligatorio.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure InstallBundledNodeIfNeeded;
var
  ResultCode: Integer;
  NodeMsiPath: string;
begin
  NodeExePath := ResolveNodePath();

  if NodeExePath <> '' then begin
    Log('Node.js detected at ' + NodeExePath);
    Exit;
  end;

  NodeMsiPath := ExpandConstant('{tmp}\node-lts-x64.msi');

  if not FileExists(NodeMsiPath) then begin
    RaiseException('No se encontro el instalador incluido de Node.js: ' + NodeMsiPath);
  end;

  Log('Installing bundled Node.js LTS from ' + NodeMsiPath);

  if not Exec(
    ExpandConstant('{sys}\msiexec.exe'),
    '/i ' + Quote(NodeMsiPath) + ' /quiet /norestart',
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  ) then begin
    RaiseException('No se pudo ejecutar msiexec para instalar Node.js.');
  end;

  if ResultCode <> 0 then begin
    RaiseException('La instalacion de Node.js fallo. Codigo: ' + IntToStr(ResultCode));
  end;

  NodeExePath := GetNodeX64Path();

  if not FileExists(NodeExePath) then begin
    RaiseException('Node.js se instalo, pero no se encontro node.exe en ' + NodeExePath);
  end;
end;

procedure VerifyReleaseLayout;
begin
  if not FileExists(ExpandConstant('{app}\backend\server.js')) then begin
    RaiseException('No se encontro {app}\backend\server.js. Revisa la carpeta release\KabalaPro.');
  end;

  if not DirExists(ExpandConstant('{app}\backend\node_modules')) then begin
    RaiseException('No se encontro {app}\backend\node_modules. La release debe incluir dependencias ya instaladas.');
  end;

  if not FileExists(ExpandConstant('{app}\dist\index.html')) then begin
    RaiseException('No se encontro {app}\dist\index.html. Ejecuta el build del frontend antes de compilar el instalador.');
  end;

  if not FileExists(ExpandConstant('{app}\tools\nssm.exe')) then begin
    RaiseException('No se encontro {app}\tools\nssm.exe.');
  end;
end;

procedure WriteBackendEnv;
var
  EnvPath: string;
  EnvText: string;
begin
  EnvPath := ExpandConstant('{app}\backend\.env');

  EnvText :=
    'PORT=' + DbPage.Values[5] + #13#10 +
    'DB_SERVER=' + DbPage.Values[0] + #13#10 +
    'DB_PORT=' + DbPage.Values[1] + #13#10 +
    'DB_DATABASE=' + DbPage.Values[2] + #13#10 +
    'DB_USER=' + DbPage.Values[3] + #13#10 +
    'DB_PASSWORD=' + DbPage.Values[4] + #13#10 +
    'TECH_EMAIL=admin@kabala.com' + #13#10 +
    'TECH_PASSWORD="$DM!N!$tr4d0r"' + #13#10 +
    'JWT_SECRET=' + GenerateSecret() + #13#10 +
    'NODE_ENV=production' + #13#10;

  if not SaveStringToFile(EnvPath, EnvText, False) then begin
    RaiseException('No se pudo escribir ' + EnvPath);
  end;
end;

function ExecNssm(Params: string; AllowFailure: Boolean): Boolean;
var
  ResultCode: Integer;
begin
  Result :=
    Exec(
      ExpandConstant('{app}\tools\nssm.exe'),
      Params,
      '',
      SW_HIDE,
      ewWaitUntilTerminated,
      ResultCode
    );

  if (not Result) and (not AllowFailure) then begin
    RaiseException('No se pudo ejecutar NSSM con parametros: ' + Params);
  end;

  if (ResultCode <> 0) and (not AllowFailure) then begin
    RaiseException('NSSM fallo con codigo ' + IntToStr(ResultCode) + '. Parametros: ' + Params);
  end;
end;

function ServiceExists(): Boolean;
var
  ResultCode: Integer;
begin
  Exec(
    ExpandConstant('{sys}\sc.exe'),
    'query {#ServiceName}',
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode
  );

  Result := ResultCode = 0;
end;

procedure RecreateBackendService;
var
  BackendPath: string;
  LogPath: string;
begin
  BackendPath := ExpandConstant('{app}\backend');
  LogPath := ExpandConstant('{app}\logs');

  ForceDirectories(LogPath);

  if ServiceExists() then begin
    ExecNssm('stop {#ServiceName}', True);
    ExecNssm('remove {#ServiceName} confirm', False);
  end;

  ExecNssm(
    'install {#ServiceName} ' + Quote(NodeExePath) + ' "server.js"',
    False
  );

  ExecNssm('set {#ServiceName} AppDirectory ' + Quote(BackendPath), False);
  ExecNssm('set {#ServiceName} DisplayName "Kabala Pro Backend"', False);
  ExecNssm('set {#ServiceName} Description "Kabala Pro local production backend"', False);
  ExecNssm('set {#ServiceName} Start SERVICE_AUTO_START', False);
  ExecNssm('set {#ServiceName} AppStdout ' + Quote(LogPath + '\backend-out.log'), False);
  ExecNssm('set {#ServiceName} AppStderr ' + Quote(LogPath + '\backend-error.log'), False);
  ExecNssm('set {#ServiceName} AppRotateFiles 1', False);
  ExecNssm('set {#ServiceName} AppRotateOnline 1', False);
  ExecNssm('set {#ServiceName} AppRotateBytes 1048576', False);
  ExecNssm('start {#ServiceName}', False);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then begin
    InstallBundledNodeIfNeeded();
    VerifyReleaseLayout();
    WriteBackendEnv();
    RecreateBackendService();
  end;
end;
