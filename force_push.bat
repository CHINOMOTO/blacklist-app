@echo off
cd c:\Users\chino\blacklist-app
echo Running Git Commands...
git status
git add .
git commit -m "fix(ui): update dashboard text (force)"
git push origin main
echo Done! Please check the output above.
pause
