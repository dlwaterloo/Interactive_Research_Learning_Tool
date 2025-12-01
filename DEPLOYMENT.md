# Deployment Guide

This guide covers deploying the QUIREY Research Learning Tool to various platforms.

## Prerequisites

- Node.js installed
- Git installed
- API keys set up in environment variables

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Steps:

1. **Install Vercel CLI** (optional, you can also use the web interface):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts. When asked about environment variables, add:
   - `VITE_GEMINI_API_KEY` = your Gemini API key
   - `VITE_SERPAPI_KEY` = your SerpAPI key

4. **Or use Vercel Web Interface**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login
   - Click "New Project"
   - Import your Git repository
   - Add environment variables in project settings
   - Deploy!

### Environment Variables in Vercel:
- Go to Project Settings → Environment Variables
- Add:
  - `VITE_GEMINI_API_KEY`
  - `VITE_SERPAPI_KEY`

## Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add your API keys

## Option 3: Deploy to GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   Add to scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

**Note**: GitHub Pages doesn't support environment variables directly. You'll need to use a different approach for API keys (not recommended for production).

## Option 4: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create a new Static Site
3. Connect your Git repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables in the dashboard

## Important Notes

⚠️ **Security**: Never commit your `.env` file to Git. Always use environment variables in your deployment platform.

⚠️ **CORS**: The SerpAPI proxy in `vite.config.js` only works in development. For production, you may need to:
- Use a server-side proxy
- Or configure CORS on your deployment platform
- Or use SerpAPI's official client library

## Post-Deployment Checklist

- [ ] Environment variables are set
- [ ] API keys are working
- [ ] Test paper search functionality
- [ ] Test AI features (Gemini)
- [ ] Check mobile responsiveness
- [ ] Verify all routes work

