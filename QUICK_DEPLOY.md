# Quick Deployment Guide

## 🚀 Fastest Way: Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/research_learning_tool.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - `VITE_GEMINI_API_KEY` = `AIzaSyBbBZpPonjSYgLMxAP2gZNSxiQrgm1lxx0`
     - `VITE_SERPAPI_KEY` = `9227eea1f95a0dd9fd04e4ac58e073a3786a27173387b9297e795679afea8a70`
6. Click **"Deploy"**

That's it! Your app will be live in ~2 minutes.

## 🔧 Alternative: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# When prompted:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? research-learning-tool
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_GEMINI_API_KEY
vercel env add VITE_SERPAPI_KEY

# Redeploy with env vars
vercel --prod
```

## 📝 Important Notes

- **API Keys**: The keys above are already in your `.env` file. For production, consider using Vercel's environment variables for better security.
- **CORS**: The SerpAPI proxy in `vite.config.js` works in development. For production on Vercel, the `vercel.json` rewrite rules handle this.
- **Custom Domain**: After deployment, you can add a custom domain in Vercel settings.

## 🎯 Your Live URL

After deployment, Vercel will give you a URL like:
`https://research-learning-tool.vercel.app`

You can share this URL with anyone!

