# 🚀 Deployment Guide

Complete guide for deploying NextStep AI frontend to production.

## 📋 Pre-Deployment Checklist

- [ ] Backend API is deployed and accessible
- [ ] Environment variables are configured
- [ ] Google OAuth credentials are set up
- [ ] Domain/subdomain is ready (if using custom domain)
- [ ] SSL certificate is configured (if self-hosting)

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Zero config, automatic HTTPS, global CDN, free tier

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Environment Variables in Vercel**:
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add:
   - `VITE_API_BASE_URL` = Your backend API URL
   - `VITE_GOOGLE_CLIENT_ID` = Your Google OAuth client ID
   - `VITE_APP_NAME` = NextStep AI

**Custom Domain**:
- Add domain in Vercel dashboard
- Update DNS records as instructed
- SSL automatically configured

---

### Option 2: Netlify

**Pros**: Simple deployment, free tier, good CI/CD

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Environment Variables in Netlify**:
1. Go to Site settings → Build & deploy → Environment
2. Add the same variables as above

**netlify.toml** (optional):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

---

### Option 4: Docker

**Dockerfile**:
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and run**:
```bash
docker build -t nextstep-frontend .
docker run -p 80:80 nextstep-frontend
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.example.com
      - VITE_GOOGLE_CLIENT_ID=your_client_id
```

---

### Option 5: Traditional Hosting (cPanel, etc.)

```bash
# Build the project
npm run build

# Upload the 'dist' folder contents to your web host
# Configure .htaccess for SPA routing
```

**.htaccess**:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_APP_NAME=NextStep AI
```

### Development Environment Variables

Keep `.env.local` for development:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your_dev_google_client_id
VITE_APP_NAME=NextStep AI (Dev)
```

---

## 🔐 Security Considerations

### 1. HTTPS
Always use HTTPS in production. Most platforms (Vercel, Netlify) provide this automatically.

### 2. Environment Variables
- Never commit `.env` files
- Use platform-specific environment variable management
- Rotate secrets regularly

### 3. CORS Configuration
Ensure your backend allows requests from your frontend domain:

```python
# Backend CORS settings
ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

### 4. Content Security Policy
Add to `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:;">
```

---

## 📊 Performance Optimization

### Build Optimization
```bash
# Production build with analysis
npm run build -- --mode production

# Check bundle size
npm run preview
```

### CDN Configuration
For assets, use a CDN:
- Cloudflare
- AWS CloudFront
- Fastly

### Caching Headers
Configure caching in your hosting platform:
- HTML: `Cache-Control: no-cache`
- JS/CSS: `Cache-Control: max-age=31536000, immutable`
- Images: `Cache-Control: max-age=31536000`

---

## 🧪 Pre-Deployment Testing

```bash
# 1. Build locally
npm run build

# 2. Preview production build
npm run preview

# 3. Test all features:
# - Login/Register
# - Resume upload
# - Roadmap generation
# - Progress tracking
# - Certificates
# - Leaderboard
# - Admin panel (if admin)

# 4. Check console for errors
# 5. Test on mobile devices
# 6. Verify API connections
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Restart dev server after changing .env
- Check platform-specific env var settings

### API Connection Issues
- Verify CORS settings on backend
- Check network tab in browser DevTools
- Ensure API URL is correct (no trailing slash)

### Blank Page After Deploy
- Check browser console for errors
- Verify all environment variables are set
- Check if base path is configured correctly

---

## 📈 Post-Deployment

### Monitoring
Set up monitoring for:
- Uptime (UptimeRobot, Pingdom)
- Performance (Google Analytics, Vercel Analytics)
- Errors (Sentry, LogRocket)

### Analytics
Add analytics to track usage:
```javascript
// Google Analytics 4
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### SEO
- Add meta tags
- Create sitemap.xml
- Submit to Google Search Console
- Add robots.txt

---

## ✅ Final Checklist

- [ ] Production build successful
- [ ] All environment variables configured
- [ ] Backend API accessible from frontend
- [ ] Google OAuth working
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Analytics configured
- [ ] Monitoring set up
- [ ] Domain configured (if custom)
- [ ] Backup plan established

---

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review platform-specific documentation
3. Check browser console and network tab
4. Verify backend API is accessible

---

**Your NextStep AI frontend is ready for production! 🎉**
