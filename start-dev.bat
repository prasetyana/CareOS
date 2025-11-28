@echo off
echo Searching for Node.js installation...

REM Common Node.js installation paths
set "NODEJS_PATHS=C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\nodejs"

REM Try to find npm
for %%p in (%NODEJS_PATHS%) do (
    if exist "%%p\npm.cmd" (
        echo Found Node.js at: %%p
        cd /d "C:\Users\A Prasetya Naharudin\Downloads\dineos-v0.1.4"
        "%%p\npm.cmd" run dev
        goto :end
    )
)

echo Node.js not found in common locations.
echo Please install Node.js from https://nodejs.org/
echo Or run this from VS Code's integrated terminal.

:end
pause
