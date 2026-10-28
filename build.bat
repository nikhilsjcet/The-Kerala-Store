@echo off
set "PATH=C:\Users\Admin\.gemini\antigravity\scratch\tools\node-v22.11.0-win-x64;%PATH%"
echo Building TheKeralaStore for production...
npm.cmd run build
pause

