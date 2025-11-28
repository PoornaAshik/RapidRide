# Quick Git Push Script for RapidRide
# Save this as: push-to-github.ps1

Write-Host "🚗 RapidRide - Git Push Helper" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized`n" -ForegroundColor Green
}

# Check if remote exists
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "⚠️  No remote repository configured." -ForegroundColor Yellow
    $username = Read-Host "Enter your GitHub username"
    $repoName = "RapidRide"
    
    Write-Host "`nAdding remote: https://github.com/$username/$repoName.git" -ForegroundColor Yellow
    git remote add origin "https://github.com/$username/$repoName.git"
    Write-Host "✅ Remote added`n" -ForegroundColor Green
} else {
    Write-Host "Remote repository: $remoteUrl`n" -ForegroundColor Green
}

# Check status
Write-Host "📊 Checking repository status..." -ForegroundColor Yellow
git status

Write-Host "`n"
$proceed = Read-Host "Do you want to add all files and commit? (y/n)"

if ($proceed -eq 'y' -or $proceed -eq 'Y') {
    # Add all files
    Write-Host "`nAdding all files..." -ForegroundColor Yellow
    git add .
    
    # Get commit message
    Write-Host "`n"
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Update RapidRide project - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    
    # Commit
    Write-Host "`nCommitting changes..." -ForegroundColor Yellow
    git commit -m "$commitMsg"
    
    # Check if main branch exists, create if not
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        Write-Host "`nRenaming branch to 'main'..." -ForegroundColor Yellow
        git branch -M main
    }
    
    # Push
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "View your repo at: $remoteUrl`n" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Push failed. Check the error above." -ForegroundColor Red
        Write-Host "Common solutions:" -ForegroundColor Yellow
        Write-Host "1. Make sure you created the repo on GitHub" -ForegroundColor White
        Write-Host "2. Check your GitHub credentials" -ForegroundColor White
        Write-Host "3. Try: git pull origin main --rebase, then push again`n" -ForegroundColor White
    }
} else {
    Write-Host "`nOperation cancelled." -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
