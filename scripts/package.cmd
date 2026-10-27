@echo off
rem Windows'un yerlesik tar araci ile gelistirme paketlerini disarida tutar.
tar.exe -a -cf "%~dp0..\..\BILP1117_Pong_Atolyesi.zip" --exclude node_modules --exclude coverage --exclude .git --exclude "*.log" --exclude "*.zip" -C "%~dp0..\.." pong
if errorlevel 1 exit /b 1
echo Teslim ZIP dosyasi hazir: BILP1117_Pong_Atolyesi.zip
