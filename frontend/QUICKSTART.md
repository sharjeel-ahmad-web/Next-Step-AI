# ⚡ Quick Start Guide

Get NextStep AI frontend running in 5 minutes!

## 🚀 Fast Setup

```bash
# 1. Extract and enter directory
unzip nextstep-frontend-final.zip
cd nextstep-frontend-final

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start development server
npm run dev
```

Visit: **http://localhost:5173**

## 🔧 Essential Configuration

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=NextStep AI
```

## 📋 Default Accounts (Backend Required)

```
Admin:
email: admin@example.com
password: admin123

User:
email: user@example.com  
password: user123
```

## ✅ Verify Installation

1. **Homepage loads** at http://localhost:5173
2. **Login page** works at http://localhost:5173/login
3. **API connection** shows no CORS errors in console

## 🆘 Quick Fixes

**Port 5173 in use?**
```bash
kill -9 $(lsof -t -i:5173)
# or change port in vite.config.js
```

**Dependencies fail?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**API not connecting?**
- Check backend is running
- Verify VITE_API_BASE_URL in .env
- Check browser console for errors

## 📚 Next Steps

- Read full [README.md](README.md)
- Check [API_INTEGRATION.md](API_INTEGRATION.md)
- Review [FEATURES.md](FEATURES.md)

Happy coding! 🎉
