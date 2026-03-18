# 🚀 NextStep AI - Frontend Application

A complete, professional frontend for the NextStep AI skill development ecosystem built with React, Vite, and modern web technologies.

## ✨ Features

### 🔐 Authentication & User Management
- Email/Password authentication with JWT
- Google OAuth 2.0 integration  
- Automatic token refresh
- Protected routes with role-based access

### 🎯 Skill Gap Analysis
- PDF resume upload and parsing
- Job description analysis
- AI-powered skill gap identification
- Personalized recommendations

### 🗺️ Learning Roadmaps
- AI-generated personalized learning paths
- Interactive roadmap visualization
- Video resource integration (YouTube)
- Progress tracking per skill node

### 📊 Progress & Gamification
- XP and leveling system
- Achievement badges
- Daily streak tracking
- Global leaderboard (all-time, monthly, weekly)

### 🏆 Certificate System
- Generate verifiable certificates
- QR code verification
- PDF download
- Public verification page

### 👑 Admin Panel
- User management dashboard
- System statistics and analytics
- Activity monitoring

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 4.4.5
- **Routing**: React Router DOM 6.16.0
- **State Management**: Zustand 4.4.1
- **HTTP Client**: Axios 1.5.0
- **Styling**: Tailwind CSS 3.3.3
- **Animations**: Framer Motion 10.16.4
- **Icons**: Lucide React 0.279.0
- **Notifications**: React Hot Toast 2.4.1
- **Charts**: Recharts 2.8.0
- **QR Codes**: qrcode.react 3.1.0

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup Steps

1. **Extract the ZIP file**
   ```bash
   unzip nextstep-frontend-final.zip
   cd nextstep-frontend-final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your values:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_APP_NAME=NextStep AI
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   App will run at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

   Production files will be in `dist/` folder

## 🌐 API Integration

This frontend integrates with **26+ backend API endpoints**:

### Authentication (7 endpoints)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Skill Gap Analysis (1 endpoint)
- `POST /api/skill-gap/analyze` - Analyze resume + job description

### Roadmaps (5 endpoints)
- `GET /api/roadmaps` - Get all roadmaps
- `POST /api/roadmaps/generate` - Generate AI roadmap
- `GET /api/roadmaps/:id` - Get single roadmap
- `DELETE /api/roadmaps/:id` - Delete roadmap
- `GET /api/roadmaps/:id/videos` - Get YouTube videos

### Progress (4 endpoints)
- `POST /api/progress/start` - Start node progress
- `POST /api/progress/:id/complete` - Complete node (+XP)
- `POST /api/progress/:id/track-video` - Track video watched
- `GET /api/progress/roadmap/:id` - Get roadmap progress

### Certificates (4 endpoints)
- `GET /api/certificates` - Get user certificates
- `POST /api/certificates/generate/:roadmapId` - Generate certificate
- `GET /api/certificates/verify/:id` - Verify certificate (public)
- `GET /api/certificates/:id/download` - Download PDF

### Gamification (3 endpoints)
- `GET /api/gamification/leaderboard` - Global leaderboard
- `GET /api/gamification/badges` - Get badges
- `GET /api/gamification/stats` - Get user stats

### Admin (2 endpoints)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system stats

## 📁 Project Structure

```
nextstep-frontend-final/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminRoute.jsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AnalyzePage.jsx
│   │   ├── RoadmapsPage.jsx
│   │   ├── RoadmapDetailPage.jsx
│   │   ├── ProgressPage.jsx
│   │   ├── CertificatesPage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── GoogleCallbackPage.jsx
│   │   └── CertificateVerifyPage.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── store/              # State management
│   │   └── authStore.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── README.md               # This file
```

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern frosted glass aesthetic
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Layout**: Works on all device sizes
- **Dark Theme**: Eye-friendly dark mode
- **Custom Scrollbars**: Polished scroll experience
- **Loading States**: Professional skeleton screens
- **Toast Notifications**: User-friendly feedback

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456-abc.apps.googleusercontent.com` |
| `VITE_APP_NAME` | Application name | `NextStep AI` |

## 🚀 Deployment

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173
kill -9 $(lsof -t -i:5173)
```

### Dependencies issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API connection errors
- Verify backend is running
- Check `VITE_API_BASE_URL` in `.env`
- Ensure CORS is configured on backend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💡 Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@nextstepai.com
- Documentation: https://docs.nextstepai.com

---

**Built with ❤️ for learners everywhere**
