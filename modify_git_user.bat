@echo off
setlocal

:: 获取参数
set "OLD_NAME=%~1"
set "NEW_NAME=%~2"
set "NEW_EMAIL=%~3"
set "COUNT=%~4"

:: 检查必要参数
if "%OLD_NAME%"=="" goto :usage
if "%NEW_NAME%"=="" goto :usage
if "%NEW_EMAIL%"=="" goto :usage

:: 默认回溯条目数为20
if "%COUNT%"=="" set "COUNT=20"

echo ========================================================
echo Git Author Rewrite Tool
echo --------------------------------------------------------
echo Target Author : "%OLD_NAME%"
echo New Author    : "%NEW_NAME%"
echo New Email     : "%NEW_EMAIL%"
echo Commit Count  : Last %COUNT% commits
echo ========================================================

:: 构造 filter-branch 的命令字符串
:: 注意：在 Windows 批处理中调用 bash 脚本片段时，双引号需要转义
set FILTER_SCRIPT="if [ \"$GIT_AUTHOR_NAME\" = \"%OLD_NAME%\" ]; then GIT_AUTHOR_NAME=\"%NEW_NAME%\"; GIT_AUTHOR_EMAIL=\"%NEW_EMAIL%\"; fi; if [ \"$GIT_COMMITTER_NAME\" = \"%OLD_NAME%\" ]; then GIT_COMMITTER_NAME=\"%NEW_NAME%\"; GIT_COMMITTER_EMAIL=\"%NEW_EMAIL%\"; fi"

:: 执行 git filter-branch
echo Executing git filter-branch...
git filter-branch --force --env-filter %FILTER_SCRIPT% HEAD~%COUNT%..HEAD

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Git history rewritten successfully.
    echo Don't forget to 'git push --force' if you have already pushed these commits.
) else (
    echo.
    echo [ERROR] Something went wrong.
)

goto :eof

:usage
echo ========================================================
echo Usage: 
echo   %~nx0 OldName NewName NewEmail [CommitCount]
echo.
echo Example: 
echo   %~nx0 "Mr.zz" "zhutao" "zhutao@kszone.com" 20
echo ========================================================
exit /b 1
