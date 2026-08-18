@echo off
title Launch NeXusWeb V6.5
cd /d "%~dp0Stable V6.5.0"
if exist "dist-electron\NeXusWeb-V6-win32-x64\NeXusWeb-V6.exe" (
    start "" "dist-electron\NeXusWeb-V6-win32-x64\NeXusWeb-V6.exe"
) else (
    npm run dev
)
