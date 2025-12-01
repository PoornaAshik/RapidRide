# 🔧 RapidRide Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: "Cannot GET /"

**Problem:** When you run `npm start` and visit `http://localhost:5500`, you see "Cannot GET /" error.

**Solutions:**

#### 1. Check if server is running
- Look for this message in terminal: `Server running on http://localhost:5500`
- If not, check errors in terminal

#### 2. Verify MongoDB is running

**Windows:**
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# If not running, start it
net start MongoDB
```

**macOS/Linux:**
```bash
# Check status
sudo systemctl status mongod

# Start if needed
sudo systemctl start mongod
```

#### 3. Check port 5500 is not in use
```powershell
# Windows - Check what's using port 5500
netstat -ano | findstr :5500

# Kill process if needed (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### 4. Verify .env file exists
```powershell
# Navigate to backend folder
cd backend

# Check if .env exists
ls .env
```

If missing, create `backend/.env`:
```
MONGO_URL=mongodb://127.0.0.1:27017/rapidride
JWT_SECRET=super_secret_key_for_rapidride
JWT_EXPIRES=1d
PORT=5500
```

#### 5. Reinstall dependencies
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Problem:** Cannot connect to MongoDB

**Solutions:**

1. **Install MongoDB** (if not installed)
   - Windows: Download from https://www.mongodb.com/try/download/community
   - macOS: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB Service**
   ```powershell
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running**
   ```bash
   # Test connection
   mongosh
   # or
   mongo
   ```

4. **Check MongoDB is listening on port 27017**
   ```powershell
   netstat -ano | findstr :27017
   ```

---

### ❌ Error: "Module not found"

**Problem:** Missing npm packages

**Solution:**
```bash
cd backend
npm install
```

---

### ❌ Error: "JWT_SECRET is not defined"

**Problem:** Environment variables not loaded

**Solutions:**

1. Create `backend/.env` file:
```env
MONGO_URL=mongodb://127.0.0.1:27017/rapidride
JWT_SECRET=super_secret_key_for_rapidride
JWT_EXPIRES=1d
PORT=5500
```

2. Verify dotenv is installed:
```bash
npm list dotenv
```

3. Check `server.js` has:
```javascript
import dotenv from "dotenv";
dotenv.config();
```

---

### ❌ Error: "Port 5500 is already in use"

**Problem:** Another application is using port 5500

**Solutions:**

1. **Find and kill process:**
   ```powershell
   # Windows
   netstat -ano | findstr :5500
   taskkill /PID <PID> /F
   ```

2. **Or change port:**
   - Edit `backend/.env`
   - Change `PORT=5500` to `PORT=3000`
   - Also update frontend files that reference port 5500

---

### ❌ Frontend shows "Failed to fetch"

**Problem:** Frontend cannot connect to backend

**Solutions:**

1. **Check backend is running**
   - Terminal should show: `Server running on http://localhost:5500`

2. **Check URL in frontend files**
   - `frontend/login.js`
   - `frontend/signup.js`
   - `frontend/rider/assets/js/api.js`
   - `frontend/driver/assets/js/api.js`
   
   All should have: `const API_URL = "http://localhost:5500";`

3. **Check CORS configuration**
   - `backend/app.js` should have:
   ```javascript
   app.use(cors({
     origin: '*',
     credentials: true
   }));
   ```

4. **Clear browser cache**
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Restart browser

---

### ❌ Login/Signup not working

**Problem:** Authentication errors

**Solutions:**

1. **Check MongoDB connection**
   - Verify MongoDB is running
   - Check `MONGO_URL` in `.env`

2. **Verify database exists**
   ```bash
   mongosh
   show dbs
   use rapidride
   show collections
   ```

3. **Check JWT_SECRET is set**
   - Verify `backend/.env` has `JWT_SECRET=...`

4. **Check console for errors**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

---

## 🚀 Quick Start Commands

### Start Everything (Windows)

```powershell
# Terminal 1 - Start MongoDB
net start MongoDB

# Terminal 2 - Start Backend
cd backend
npm start

# Browser
# Open http://localhost:5500
```

### Start Everything (macOS/Linux)

```bash
# Terminal 1 - Start MongoDB
sudo systemctl start mongod

# Terminal 2 - Start Backend
cd backend
npm start

# Browser
# Open http://localhost:5500
```

---

## 📝 Useful Commands

### Check Service Status
```powershell
# MongoDB
Get-Service -Name MongoDB

# Node processes
Get-Process -Name node
```

### Kill Processes
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Kill specific port
netstat -ano | findstr :5500
taskkill /PID <PID> /F
```

### MongoDB Commands
```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use rapidride database
use rapidride

# Show collections
show collections

# View users
db.users.find()

# Clear users (reset)
db.users.deleteMany({})
```

---

## 🔍 Debug Mode

Run the backend with debug logs:

```bash
cd backend
set DEBUG=* && npm start
```

---

## 📞 Still Having Issues?

1. Check terminal/console for error messages
2. Ensure all dependencies are installed: `npm install`
3. Verify MongoDB is running
4. Check `.env` file configuration
5. Try restarting everything:
   - Close all terminals
   - Stop MongoDB
   - Start MongoDB
   - Start backend
   - Hard refresh browser (Ctrl+Shift+R)

---

## ✅ Verify Setup Checklist

- [ ] MongoDB is installed and running
- [ ] Node.js is installed (v14+)
- [ ] Backend `node_modules` folder exists
- [ ] Backend `.env` file exists with correct values
- [ ] Port 5500 is not in use by another application
- [ ] Terminal shows "Server running on http://localhost:5500"
- [ ] Terminal shows "MongoDB connected successfully"
- [ ] Browser can access http://localhost:5500
- [ ] No errors in browser console (F12)

If all checked, your setup is correct! ✅
