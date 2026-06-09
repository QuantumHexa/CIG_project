# Run after: gh auth login
# Creates public repo "cig-project" and pushes all code

Set-Location $PSScriptRoot\..

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "Install GitHub CLI: https://cli.github.com/"
  exit 1
}

gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Run: gh auth login"
  exit 1
}

$exists = gh repo view cig-project 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create cig-project --public --description "Event and Media Management Platform - CIG Dev PS" --source=. --remote=origin
} else {
  git remote remove origin 2>$null
  git remote add origin "https://github.com/$(gh api user -q .login)/cig-project.git"
}

git push -u origin main
Write-Host "Done! Repo: https://github.com/$(gh api user -q .login)/cig-project"
