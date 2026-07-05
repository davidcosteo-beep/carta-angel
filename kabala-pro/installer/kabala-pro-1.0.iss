#define MyAppName "Kabala Pro"
#define MyAppVersion "1.0"
#define MyAppPublisher "Kabala Pro"
#define MyAppURL "http://localhost:4000"
#define SourceDir "..\release\KabalaPro"

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

[Icons]
Name: "{autoprograms}\Kabala Pro"; Filename: "http://localhost:4000"

[Run]
Filename: "{app}\docs\installer.md"; Description: "Abrir guia de instalacion"; Flags: postinstall shellexec skipifsilent nowait
Filename: "{cmd}"; Parameters: "/c ""{app}\scripts\windows\init-database.bat"""; Description: "Inicializar base de datos Kabala Pro"; Flags: postinstall unchecked runascurrentuser waituntilterminated
Filename: "{cmd}"; Parameters: "/c ""{app}\scripts\windows\install-kabala-service.bat"""; Description: "Instalar servicio KabalaPro"; Flags: postinstall unchecked waituntilterminated
Filename: "http://localhost:4000"; Description: "Abrir Kabala Pro"; Flags: postinstall unchecked shellexec skipifsilent nowait

[UninstallRun]
Filename: "{cmd}"; Parameters: "/c ""{app}\scripts\windows\uninstall-kabala-service.bat"""; Flags: runascurrentuser waituntilterminated
