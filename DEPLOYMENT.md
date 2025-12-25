# Deployment Guide

This guide covers deploying OpenChess to production using Vercel and Supabase (both free tier).

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free)
- A [Supabase](https://supabase.com) account (free)

## Step 1: Set Up Supabase

### Create a Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New project"
3. Choose your organization
4. Enter a project name (e.g., "openchess")
5. Generate a strong database password (save it!)
6. Select the nearest region
7. Click "Create new project"

### Configure Database

1. Wait for the project to initialize
2. Go to **SQL Editor** in the sidebar
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL editor and click "Run"
5. Verify tables were created in **Table Editor**

### Enable Realtime

1. Go to **Database** > **Replication**
2. Click on "supabase_realtime"
3. Enable replication for `games` and `moves` tables

### Get API Keys

1. Go to **Settings** > **API**
2. Note down:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJ...`

### Configure Authentication

1. Go to **Authentication** > **Providers**
2. Email provider is enabled by default
3. (Optional) Enable Google OAuth:
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URL to `https://your-domain.vercel.app/auth/callback`

## Step 2: Deploy to Vercel

### Push to GitHub

1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/openchess.git
   git push -u origin main
   ```

### Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Set Environment Variables

1. In the Vercel project settings, go to "Environment Variables"
2. Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
   ```
3. Make sure they're enabled for Production, Preview, and Development

### Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app is now live! 🎉

## Step 3: Post-Deployment

### Update Supabase URLs

1. Go to Supabase > **Authentication** > **URL Configuration**
2. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

### Set Up Custom Domain (Optional)

1. In Vercel, go to your project's "Domains" settings
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Update Supabase redirect URLs with your custom domain

## Monitoring

### Vercel Analytics

1. Enable Analytics in your Vercel project
2. View performance metrics in the dashboard

### Supabase Dashboard

1. Monitor database usage in Supabase dashboard
2. Check authentication logs
3. View realtime connection stats

## Troubleshooting

### Build Failures

- Check Vercel build logs for errors
- Ensure all environment variables are set
- Verify dependencies are correctly installed

### Authentication Issues

- Verify Supabase URL and anon key
- Check redirect URLs in Supabase auth settings
- Ensure the auth callback route exists

### Database Issues

- Verify RLS policies allow the operations
- Check Supabase logs for SQL errors
- Ensure tables were created correctly

### Realtime Not Working

- Verify realtime is enabled for tables
- Check browser console for WebSocket errors
- Ensure Supabase Realtime quotas aren't exceeded

## Scaling

### Supabase Limits (Free Tier)

- 500MB database storage
- 2GB bandwidth per month
- 50K monthly active users
- Unlimited realtime connections

### Vercel Limits (Free Tier)

- 100GB bandwidth per month
- Serverless functions included
- Unlimited deployments

### When to Upgrade

Consider upgrading when you:
- Approach storage/bandwidth limits
- Need custom domains without Vercel branding
- Require advanced features (backups, analytics)
- Have high-traffic requirements

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Anon key (not service key) used in frontend
- [ ] Auth redirect URLs properly configured
- [ ] CORS settings reviewed
- [ ] Rate limiting considered for API routes

