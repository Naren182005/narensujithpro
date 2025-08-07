# 🔧 Fix Google Authentication Error

## Current Issue
You're seeing the error: **"Google login failed. Please try again or use email login."**

## Root Cause
The Google Client ID in your `.env` file is not properly configured in Google Cloud Console for your development environment.

## 🚀 Quick Fix (Development Mode)
**I've added a temporary development mode that works immediately:**

1. **Restart your development server** (if not already done):
   ```bash
   npm run dev
   ```

2. **Look for the orange "Development Mode Login" button** on the login page
3. **Click it to test the authentication flow** without Google OAuth setup

This will create a mock user and let you test the app functionality while you set up proper Google authentication.

## 🔧 Permanent Fix (Google Cloud Console Setup)

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Configure OAuth Consent Screen
1. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** user type
3. Fill in required fields:
   - **App name**: `SocialMuse` (or your preferred name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **"Save and Continue"**
5. Skip the "Scopes" section for now
6. Add yourself as a test user if needed
7. Click **"Save and Continue"**

### Step 3: Configure OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Find your OAuth 2.0 Client ID (or create one if it doesn't exist)
3. Click on the Client ID to edit it
4. In **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```
5. In **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```
6. Click **"Save"**

### Step 4: Enable Required APIs
1. Go to **"APIs & Services"** → **"Library"**
2. Search for and enable these APIs:
   - **Google Identity Toolkit API**
   - **People API**
   - **Google Sign-In API** (if available)

### Step 5: Wait and Test
1. **Wait 5-10 minutes** for changes to propagate
2. **Clear your browser cache** or use incognito mode
3. **Test the Google login button** on your app

## 🔍 Troubleshooting

### If Google login still fails:

1. **Check browser console** for specific error messages
2. **Verify the Client ID** in your `.env` file matches the one in Google Cloud Console
3. **Make sure your app domain is correct** in the OAuth consent screen
4. **Try incognito mode** to avoid cached authentication issues

### Common Error Messages:

- **"redirect_uri_mismatch"**: Add your localhost URLs to authorized redirect URIs
- **"invalid_client"**: Check that your Client ID is correct
- **"access_blocked"**: Your OAuth consent screen needs to be configured

## 🛠️ Alternative Solutions

### Option 1: Use Development Mode (Temporary)
- Use the orange "Development Mode Login" button I added
- This creates a mock user for testing
- Perfect for development and testing features

### Option 2: Use Email/Password Login
- The app also supports traditional email/password authentication
- Create an account using the email form
- This doesn't require Google OAuth setup

### Option 3: Create New Google Project
If the current Client ID is from an old/deleted project:
1. Create a new Google Cloud project
2. Set up OAuth from scratch
3. Update the `VITE_GOOGLE_CLIENT_ID` in your `.env` file

## 📝 Current Configuration

Your current Google Client ID: `763549280829-chb0u2g8vbc3uflojo61dua7832bdivd.apps.googleusercontent.com`

**Status**: ❌ Invalid or misconfigured
**Required Action**: Follow the steps above to configure it properly

## ✅ Success Indicators

You'll know it's working when:
- No error message appears when clicking "Sign in with Google"
- Google's OAuth popup opens successfully
- You're redirected back to the app after authentication
- You see a success message and are logged in

## 🆘 Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify all steps above were completed
3. Try the development mode button as a temporary workaround
4. Consider using email/password authentication instead
