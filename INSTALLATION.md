# COMPLETE INSTALLATION GUIDE

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js v18 or higher installed
- [ ] npm (comes with Node.js)
- [ ] Internet connection
- [ ] Text editor (VS Code recommended)
- [ ] 2 terminal windows

### Check Node.js Version

```bash
node --version
# Should show v18.x.x or higher
```

If not installed, download from: https://nodejs.org/

---

## 🚀 Step-by-Step Installation

### STEP 1: Install Backend Dependencies

Open Terminal 1 in the `Legal` folder:

```bash
cd backend
npm install
```

**What this does:**
- Installs Express (web server)
- Installs MongoDB driver
- Installs PDF/DOCX parsers
- Installs AI libraries
- Takes 2-3 minutes

**Expected output:**
```
added 150 packages in 2m
```

**If you see errors:**
- Check internet connection
- Try: `npm cache clean --force` then retry
- Ensure you're in the `backend` folder

---

### STEP 2: Install Frontend Dependencies

Open Terminal 2 in the `Legal` folder:

```bash
cd frontend
npm install
```

**What this does:**
- Installs React
- Installs Vite (build tool)
- Installs Tailwind CSS
- Takes 1-2 minutes

**Expected output:**
```
added 200 packages in 1m
```

---

### STEP 3: Setup MongoDB Atlas (FREE)

#### 3.1: Create Account
1. Go to https://cloud.mongodb.com
2. Click "Try Free"
3. Sign up with email or Google
4. Verify email

#### 3.2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 FREE" tier
3. Select region closest to you
4. Click "Create"
5. Wait 3-5 minutes for cluster creation

#### 3.3: Create Database User
1. Click "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `legalai`
5. Password: `legalai123` (or your choice)
6. User Privileges: "Read and write to any database"
7. Click "Add User"

#### 3.4: Allow Network Access
1. Click "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### 3.5: Get Connection String
1. Click "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://legalai:<password>@cluster0.xxxxx.mongodb.net/`

**IMPORTANT:** Replace `<password>` with your actual password!

Example:
```
mongodb+srv://legalai:legalai123@cluster0.xxxxx.mongodb.net/legalai
```

---

### STEP 4: Setup Groq API (FREE)

#### 4.1: Create Account
1. Go to https://console.groq.com
2. Click "Sign Up"
3. Sign up with email or Google
4. Verify email

#### 4.2: Create API Key
1. Click "API Keys" (left sidebar)
2. Click "Create API Key"
3. Name: "Legal AI Project"
4. Click "Create"
5. **COPY THE KEY IMMEDIATELY** (you can't see it again!)
6. It looks like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### STEP 5: Create .env File

In the `backend` folder, create a file named `.env` (exactly, no .txt extension):

**Windows:**
```bash
cd backend
type nul > .env
notepad .env
```

**Mac/Linux:**
```bash
cd backend
touch .env
nano .env
```

**Paste this content:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://legalai:legalai123@cluster0.xxxxx.mongodb.net/legalai
JWT_SECRET=my_super_secret_key_for_jwt_12345
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
NODE_ENV=development
```

**Replace:**
- `MONGODB_URI`: Your actual MongoDB connection string
- `GROQ_API_KEY`: Your actual Groq API key

**Save and close the file.**

---

### STEP 6: Start Backend Server

In Terminal 1 (backend folder):

```bash
npm start
```

**Expected output:**
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

**If you see errors, check:**
- `.env` file exists in `backend` folder
- MongoDB URI is correct
- Groq API key is correct
- Port 5000 is not in use

**Keep this terminal running!**

---

### STEP 7: Start Frontend Server

In Terminal 2 (frontend folder):

```bash
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**Keep this terminal running!**

---

### STEP 8: Open Application

1. Open browser
2. Go to: http://localhost:3000
3. You should see the login page

---

### STEP 9: Create Account

1. Click "Sign Up"
2. Enter:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
3. Click "Sign Up"
4. You should be logged in automatically

---

### STEP 10: Test the System

1. **Upload Tab:**
   - Click "Choose File"
   - Select `sample_legal_document.txt` from the Legal folder
   - Click "Upload Document"
   - Wait for success message

2. **Simplification Tab:**
   - Click "Simplify Document"
   - Wait 10-15 seconds
   - See original vs simplified text

3. **Entities Tab:**
   - Click "Extract Entities"
   - See extracted legal terms

4. **Translation Tab:**
   - Select "Hindi"
   - Click "Translate"
   - Wait 10-15 seconds
   - See Hindi translation

5. **Q&A Tab:**
   - Click "Prepare for Q&A"
   - Wait 20-30 seconds
   - Type: "Who is the seller?"
   - Press Enter
   - See answer with source

**If everything works, you're done! 🎉**

---

## 🐛 Common Issues & Solutions

### Issue 1: "npm: command not found"

**Solution:**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation
- Verify: `node --version`

---

### Issue 2: "Cannot find module 'express'"

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### Issue 3: "MongoServerError: bad auth"

**Solution:**
- Check MongoDB username and password in `.env`
- Ensure you replaced `<password>` in connection string
- Check Database Access in MongoDB Atlas

---

### Issue 4: "Groq API error: 401 Unauthorized"

**Solution:**
- Check Groq API key in `.env`
- Ensure no extra spaces in the key
- Create a new API key if needed

---

### Issue 5: "Port 5000 already in use"

**Solution:**

**Option A - Change Port:**
1. Edit `.env`: `PORT=5001`
2. Edit `frontend/src/context/DocumentContext.jsx`:
   - Change `http://localhost:5000/api` to `http://localhost:5001/api`

**Option B - Kill Process:**

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

---

### Issue 6: "Network Error" in frontend

**Solution:**
- Check backend is running (Terminal 1)
- Check backend URL in `DocumentContext.jsx`
- Check browser console (F12) for errors
- Try: `http://localhost:5000/health` in browser (should show "OK")

---

### Issue 7: Frontend shows blank page

**Solution:**
- Check browser console (F12)
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito mode
- Check frontend terminal for errors

---

### Issue 8: "Invalid token" error

**Solution:**
- Logout and login again
- Clear browser localStorage:
  - F12 → Application → Local Storage → Clear
- Refresh page

---

### Issue 9: Simplification/Translation takes too long

**Solution:**
- This is normal (10-20 seconds)
- Groq API processes the request
- Check Groq API rate limits
- Try with smaller document

---

### Issue 10: Q&A not working

**Solution:**
- Click "Prepare for Q&A" first
- Wait for "Document ready for Q&A" message
- Check document has text
- Try simpler questions first

---

## 🔍 Verification Commands

### Check if backend is running:
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","message":"Legal AI Backend Running"}
```

### Check MongoDB connection:
- Look for "✅ MongoDB Connected" in backend terminal

### Check frontend is running:
- Open http://localhost:3000 in browser

### Check .env file exists:
```bash
cd backend
ls -la .env  # Mac/Linux
dir .env     # Windows
```

---

## 📞 Still Having Issues?

1. **Check all terminals for error messages**
2. **Read error messages carefully**
3. **Google the specific error**
4. **Check README.md for more details**
5. **Review code comments**

---

## ✅ Success Checklist

After installation, you should have:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can login/signup
- [ ] Can upload document
- [ ] Can simplify document
- [ ] Can extract entities
- [ ] Can translate document
- [ ] Can ask questions

**If all checked, you're ready to demo! 🚀**

---

## 🎯 Next Steps

1. Read `VIVA_GUIDE.md` for concepts
2. Practice the demo flow
3. Understand the code
4. Prepare for questions
5. Test with different documents

**Good luck! 🎓**
