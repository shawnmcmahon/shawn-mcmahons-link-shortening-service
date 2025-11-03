# Vercel Deployment Guide

Follow these steps to deploy your link shortening service to Vercel.

## Prerequisites

1. ✅ Your code is working locally
2. ✅ Your code is committed to a Git repository (GitHub, GitLab, or Bitbucket)
3. ✅ You have a Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Push Your Code to Git

Make sure all your code is committed and pushed to your repository:

```bash
git add .
git commit -m "Ready for deployment"
git push
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Choose your repository
   - Click **"Import"**
4. Configure your project:
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```
   
3. Follow the prompts:
   - Login to Vercel
   - Link to existing project or create new
   - Confirm settings

## Step 3: Add Environment Variables

**Important:** You must add your Firebase environment variables in Vercel.

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add each of these variables (use the same values from your `.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

4. For each variable:
   - Paste the value
   - Select **"Production"**, **"Preview"**, and **"Development"** environments
   - Click **"Save"**

5. **Redeploy** after adding variables:
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**

## Step 4: Update Firebase Authentication Settings

### 4.1: Add Vercel Domain to Authorized Domains

You need to add your Vercel domain to Firebase Auth allowed domains:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Vercel domain (e.g., `your-project.vercel.app`)
6. If you have a custom domain, add that too
7. Click **"Done"**

### 4.2: Configure Google OAuth in Google Cloud Console

**Important:** If Google Sign-In works locally but not in production, you need to configure OAuth redirect URIs in Google Cloud Console. Unfortunately, **this cannot be done entirely in Firebase Console** - you need to access Google Cloud Console.

**Why both are needed:**
- **Firebase Authorized Domains** (Step 4.1): Controls which domains Firebase Auth accepts requests from
- **Google Cloud OAuth Settings** (Step 4.2): Controls which domains Google's OAuth service accepts - this is what's causing the popup to close immediately

**Prerequisites - Verify Google Sign-In is enabled:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Sign-in method**
3. Verify **Google** provider is enabled (toggle should be ON)
4. If not enabled, click **Google**, toggle **Enable** to ON, enter a project support email, and click **Save**
5. This should automatically create an OAuth 2.0 Client ID in Google Cloud Console

**To configure OAuth redirect URIs:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   - **Note:** This is the same project as your Firebase project (uses the same project ID)
   - If you don't have access, you may need to enable Google Cloud Console access for your Firebase project
2. Select your Firebase project (same project ID)
3. Navigate to **APIs & Services** → **Credentials**

4. **If you see OAuth 2.0 Client IDs:**
   - Find your OAuth 2.0 Client ID (usually named "Web client (auto created by Google Service)" or similar)
   - Click to edit it
   - Under **"Authorized JavaScript origins"**, add:
     - `https://your-project.vercel.app`
     - `https://your-custom-domain.com` (if applicable)
   - Under **"Authorized redirect URIs"**, add:
     - `https://your-project.vercel.app/__/auth/handler`
     - `https://your-custom-domain.com/__/auth/handler` (if applicable)
   - Click **"Save"**

5. **If you see "No OAuth clients to display":**
   
   **Step A: Verify Firebase setup**
   - Go to Firebase Console → Authentication → Sign-in method
   - Make sure **Google** provider is enabled (toggle ON)
   - If it wasn't enabled, enable it now and wait 2-3 minutes
   - Refresh the Google Cloud Console credentials page
   
   **Step B: Check OAuth Consent Screen (Required for manual creation)**
   - In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
   - If you see "App is not configured", you need to configure it:
     - User Type: Choose **External** (unless you have a Google Workspace)
     - Fill in App name, Support email, Developer contact
     - Click **Save and Continue**
     - Skip Scopes (click **Save and Continue**)
     - Skip Test users (click **Save and Continue**)
     - Review and **Back to Dashboard**
   
   **Step C: Create OAuth Client (if still not visible after Step A)**
   - Go back to **APIs & Services** → **Credentials**
   - Click **"+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Firebase Web Client` (or any name)
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for local dev)
     - `https://your-project.vercel.app`
     - `https://your-custom-domain.com` (if applicable)
   - **Authorized redirect URIs:**
     - `https://your-project.vercel.app/__/auth/handler`
     - `https://your-custom-domain.com/__/auth/handler` (if applicable)
   - Click **Create**
   - **Note:** Copy the Client ID - you may need it later, but Firebase will typically auto-detect it

**Note:** The redirect URI format `*/__/auth/handler` is Firebase's default OAuth callback handler. If you're using custom domains, make sure both the Vercel domain and custom domain are added.

**Can't access Google Cloud Console?** 
- Firebase projects are Google Cloud projects under the hood
- You may need to enable Google Cloud Console access: Firebase Console → Project Settings → General → Cloud Resource Location → Enable Google Cloud Console

## Step 5: Test Your Deployment

1. Visit your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Test the following:
   - ✅ Sign up / Sign in works
   - ✅ Create a shortened link
   - ✅ Click the shortened link (redirects correctly)
   - ✅ View analytics
   - ✅ Delete a link

## Step 6: (Optional) Add Custom Domain

1. In Vercel Dashboard, go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Firebase Authorized domains with your custom domain

### Changing Your Vercel Domain (*.vercel.app)

**Important:** The `*.vercel.app` domain is based on your **project slug**, not the project name. Simply renaming your project in the dashboard won't change the domain.

**Why you can't change it:** The project slug is set when you first create the project and typically **cannot be changed** afterward. The slug field is often not visible or editable in Settings → General.

**To get a shorter domain (e.g., from `link-shortening-service.vercel.app` to `links.vercel.app`):**

**Create a New Project with the Desired Slug:**
1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import the **same Git repository** as your current project
3. **Important:** When naming the project, use your desired short name (e.g., `links`). The project slug will be auto-generated from this name.
   - If you want `links.vercel.app`, name your project `links`
   - The slug is derived from the project name (spaces become hyphens, special chars removed)
4. Complete the deployment setup
5. **Copy all environment variables** from your old project:
   - Go to old project → **Settings** → **Environment Variables**
   - Go to new project → **Settings** → **Environment Variables**
   - Add all the same variables with the same values
6. **Update Firebase and OAuth settings** with the new domain
7. Test that everything works on the new domain
8. Once confirmed, you can delete the old project (optional)

**After changing the domain, remember to:**
- Update Firebase Authorized Domains with the new domain (`links.vercel.app`)
- Update Google OAuth settings in Google Cloud Console with the new domain
- Redeploy to ensure everything works correctly

**Alternative: Use a Custom Domain**
- If you own a domain (e.g., `links.co`, `lnk.to`), you can add it in **Settings** → **Domains**
- This gives you a short, custom URL without creating a new project

## Troubleshooting

### "Missing environment variables"
- Make sure all `NEXT_PUBLIC_*` variables are added in Vercel
- Redeploy after adding variables

### "Firebase Auth not working" / "Google Sign-In popup closes immediately"
- **Check Firebase Authorized Domains:**
  - Go to Firebase Console → Authentication → Settings → Authorized domains
  - Ensure your Vercel domain (`*.vercel.app`) is added
  - Ensure any custom domains are added
- **Check Google Cloud Console OAuth Configuration:**
  - Go to Google Cloud Console → APIs & Services → Credentials
  - Edit your OAuth 2.0 Client ID
  - Verify your Vercel domain is in "Authorized JavaScript origins"
  - Verify the redirect URI `https://your-domain.com/__/auth/handler` is in "Authorized redirect URIs"
- **Verify environment variables are correct:**
  - Double-check `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches your Firebase project
  - Ensure all Firebase env vars are set in Vercel
  - Redeploy after adding/changing environment variables
- **Check browser console:**
  - Open browser DevTools (F12) → Console tab
  - Look for specific error messages when clicking "Sign in with Google"
  - Common errors: `auth/unauthorized-domain`, `auth/popup-blocked`, `auth/popup-closed-by-user`

### "Links not redirecting"
- Check browser console for errors
- Verify Firestore security rules allow public read
- Check that short links are being created correctly

### "Build fails"
- Check the build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Make sure Node.js version is compatible (Vercel uses Node 18+ by default)

### "Cannot change project slug" / "Domain not shortened after renaming project"
- **The project slug cannot be changed after creation** - it's locked when the project is first created
- Renaming the project name does NOT change the `*.vercel.app` domain
- **Solution:** Create a new project with your desired short name (see "Changing Your Vercel Domain" section above)
- **Note:** You cannot manually add `*.vercel.app` domains as aliases - they're automatically generated from the project slug

### "Cannot add links.vercel.app since it's aliased to another deployment"
- This means `links.vercel.app` is already taken by another Vercel project (possibly in another account, or another project in your account)
- **Solution 1:** Try a different short name (e.g., `lnk`, `go`, `s`)
- **Solution 2:** Create a new project with a different name
- **Solution 3:** Use a custom domain you own instead of trying to use an existing `*.vercel.app` domain

## Post-Deployment Checklist

- [ ] Environment variables added to Vercel
- [ ] Firebase Auth authorized domains updated
- [ ] First deployment successful
- [ ] Can sign in/sign up
- [ ] Can create shortened links
- [ ] Shortened links redirect correctly
- [ ] Analytics page works
- [ ] Can delete links
- [ ] (Optional) Custom domain configured

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- **Production:** Deploys from `main` or `master` branch
- **Preview:** Creates preview deployments for pull requests

Every time you push code, Vercel will automatically deploy the changes!

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check Vercel build logs if deployment fails
