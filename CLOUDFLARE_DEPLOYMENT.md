# Cloudflare Pages Deployment Guide

## Prerequisites
1. A Cloudflare account (https://dash.cloudflare.com/)
2. A GitHub account with this repository pushed
3. Node.js 18+ installed locally

## Step 1: Push to GitHub
```bash
git remote add origin https://github.com/YOUR-USERNAME/productivity-calendar.git
git branch -M main
git push -u origin main
```

## Step 2: Connect Cloudflare Pages to GitHub

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git**
4. Authorize Cloudflare to access your GitHub account
5. Select the `productivity-calendar` repository
6. Click **Begin setup**

## Step 3: Configure Build Settings

In the Cloudflare Pages setup:

**Production Branch:** `main`

**Build Settings:**
- Framework preset: `Next.js`
- Build command: `npm run pages:build`
- Build output directory: `.next`

**Environment Variables:**

Add these environment variables in Cloudflare Pages settings:

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.pages.dev
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=your-mongodb-connection-string
NODE_ENV=production
```

## Step 4: MongoDB Setup

If you don't have MongoDB:
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Get your connection string
4. Add it as `MONGODB_URI` environment variable

## Step 5: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add these URIs:
   - Authorized JavaScript origins: `https://your-domain.pages.dev`
   - Authorized redirect URIs: `https://your-domain.pages.dev/api/auth/callback/google`
6. Copy the Client ID and Client Secret

## Step 6: Deploy

1. Push your changes to GitHub
2. Cloudflare Pages will automatically build and deploy
3. Your site will be available at `https://your-domain.pages.dev`

## Step 7: Custom Domain (Optional)

1. In Cloudflare Pages project settings
2. Go to **Custom domains**
3. Add your custom domain
4. Follow DNS instructions

## Troubleshooting

### Build fails with MongoDB errors
- Ensure `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist includes all IPs (0.0.0.0/0)

### OAuth redirect issues
- Verify `NEXTAUTH_URL` matches your Cloudflare Pages domain
- Check Google OAuth redirect URIs are configured correctly

### Build output directory not found
- Ensure `next build` completes successfully
- Check `.next` directory exists locally

## Local Testing Before Deployment

Test the Cloudflare build locally:

```bash
npm install
npm run pages:build
npm run start
```

## Environment Variables Reference

| Variable | Example | Required |
|----------|---------|----------|
| `NEXTAUTH_SECRET` | `your-secret-key` | Yes |
| `NEXTAUTH_URL` | `https://productivity-calendar.pages.dev` | Yes |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Yes (for Google login) |
| `GOOGLE_CLIENT_SECRET` | `your-secret` | Yes (for Google login) |
| `MONGODB_URI` | `mongodb+srv://...` | Yes |
| `NODE_ENV` | `production` | No (defaults to production on Cloudflare) |

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Cloudflare @next-on-pages](https://github.com/cloudflare/next-on-pages)
