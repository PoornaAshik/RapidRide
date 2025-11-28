# 🚀 Quick Start: Push to GitHub

## Prerequisites
1. Create a repository named "RapidRide" on GitHub
2. Have Git installed on your computer

---

## Option 1: Use the Automated Script (Easiest)

```powershell
cd C:\Users\ashik\Downloads\RAPIDRIDE\RAPIDRIDE
.\push-to-github.ps1
```

Follow the prompts!

---

## Option 2: Manual Commands

### Step 1: Open PowerShell
```powershell
cd C:\Users\ashik\Downloads\RAPIDRIDE\RAPIDRIDE
```

### Step 2: Initialize Git (first time only)
```powershell
git init
```

### Step 3: Configure Git (first time only)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Add all files
```powershell
git add .
```

### Step 5: Commit
```powershell
git commit -m "Initial commit: Complete RapidRide application"
```

### Step 6: Add GitHub remote (replace YOUR_USERNAME)
```powershell
git remote add origin https://github.com/YOUR_USERNAME/RapidRide.git
```

### Step 7: Push
```powershell
git branch -M main
git push -u origin main
```

---

## 🎉 Done!

Visit: `https://github.com/YOUR_USERNAME/RapidRide`

---

## For Future Updates

```powershell
git add .
git commit -m "Your commit message"
git push
```

---

## Need Help?

See **GITHUB_PUSH_GUIDE.md** for detailed instructions and troubleshooting.
