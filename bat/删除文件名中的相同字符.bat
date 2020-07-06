::把此文件放到包含文件的文件夹内
::!wind:xx=!中"："与"="之间的字符是要删除的字符
@echo off& setlocal enabledelayedexpansion
for /f "delims=" %%1 in ('dir /a /b') do (set wind=%%1
ren "%%~1" "!wind:-min=!")