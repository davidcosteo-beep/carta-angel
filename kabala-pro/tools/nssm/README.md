# NSSM

Kabala Pro uses one installed NSSM location: `<app>\tools\nssm\nssm.exe`.

Required compiler dependency source:

```bat
installer\dependencies\nssm.exe
```

Place the real binary at that installer dependency path before compiling. It is
not downloaded or generated. The Windows scripts require the installed local
copy and do not fall back to `PATH`.
