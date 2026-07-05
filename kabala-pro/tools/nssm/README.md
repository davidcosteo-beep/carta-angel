# NSSM

Place `nssm.exe` in this folder before building the production package if the target PC should not depend on NSSM being available in `PATH`.

Recommended installed path:

```bat
D:\KabalaPro\tools\nssm\nssm.exe
```

The Windows service scripts first look for this local executable. If it is not present, they fall back to `nssm.exe` from `PATH`.
