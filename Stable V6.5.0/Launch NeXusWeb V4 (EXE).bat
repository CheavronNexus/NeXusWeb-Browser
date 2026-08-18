@echo off
title NeXusWeb V4 (Standalone Production Binary)
cd /d "%~dp0"
echo Starting NeXusWeb V4...
start "" "%~dp0dist-electron\NeXusWeb-V4-win32-x64\NeXusWeb-V4.exe"
exit
