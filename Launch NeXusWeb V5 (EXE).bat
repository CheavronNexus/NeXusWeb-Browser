@echo off
title Launching NeXusWeb V5...
cd /d "%~dp0prototype V5"
if exist "dist-electron\NeXusWeb-V5-win32-x64\NeXusWeb-V5.exe" (
    start "" "dist-electron\NeXusWeb-V5-win32-x64\NeXusWeb-V5.exe"
) else (
    npm run dev
)
