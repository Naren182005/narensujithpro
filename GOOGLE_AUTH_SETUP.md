# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for your React application.

## 🚨 IMPORTANT: Issues Fixed

Your app had database connection issues. These have been resolved:
- ✅ Database configuration fixed
- ✅ Server will start even if database is unavailable
- ✅ Google authentication will work with temporary storage

## Prerequisites

- Google Cloud Console account
- Node.js and npm installed
- Your React application running

## Step 1: Google Cloud Console Setup (DETAILED)

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the **project dropdown** at the top (next to "Google Cloud")
3. Click **"NEW PROJECT"**
4. Enter a project name: `SocialMuse-Auth` (or any name you prefer)
5. Click **"CREATE"**
6. Wait for the project to be created, then **select it**

### 1.2 Enable Required APIs (NOT Google+ API!)

**⚠️ IMPORTANT:** Google+ API is deprecated. Use these instead:

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for **"Google Identity Toolkit API"**
3. Click on it and press **"ENABLE"**
4. Also search for **"People API"** and **"ENABLE"** it
5. Search for **"Google Sign-In API"** and **"ENABLE"** it if available

### 1.3 Configure OAuth Consent Screen (REQUIRED FIRST)

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Fill in the **App Information**:
   - **App name:** `SocialMuse` (or your app name)
   - **User support email:** Your email address
   - **App logo:** (optional, you can skip this)
   - **App domain:** Leave blank for now
   - **Developer contact information:** Your email address
4. Click **"SAVE AND CONTINUE"**

5. **Scopes:** Click **"ADD OR REMOVE SCOPES"**
   - Search and add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
     - `openid`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

6. **Test users:** Click **"ADD USERS"**
   - Add your email address as a test user
   - Add any other emails you want to test with
   - Click **"SAVE AND CONTINUE"**

7. **Summary:** Review and click **"BACK TO DASHBOARD"**

### 1.4 Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. **Name:** `SocialMuse Web Client`
5. **Authorized JavaScript origins:**
   - Click **"ADD URI"** and add: `http://localhost:5173`
   - Click **"ADD URI"** and add: `http://127.0.0.1:5173`
6. **Authorized redirect URIs:**
   - Click **"ADD URI"** and add: `http://localhost:5173`
   - Click **"ADD URI"** and add: `http://127.0.0.1:5173`
7. Click **"CREATE"**
8. **COPY THE CLIENT ID** - you'll need this!
9. Click **"OK"** to close the popup

## Step 2: Environment Configuration

### 2.1 Update .env file

Add your Google Client ID to your `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

Replace `your-google-client-id-here` with the Client ID you copied from Google Cloud Console.

### 2.2 Restart your development server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

## Step 3: Backend Setup (Already Done)

The following backend components have been set up for you:

- ✅ Google authentication route (`/api/auth/google`)
- ✅ User model updated to support Google auth
- ✅ JWT token generation and verification
- ✅ Database integration

## Step 4: Frontend Setup (Already Done)

The following frontend components have been set up for you:

- ✅ Google OAuth provider in `main.tsx`
- ✅ Google authentication service (`src/lib/google-auth.ts`)
- ✅ Updated Login component with Google login button
- ✅ Authentication context for state management

## Step 5: Testing the Setup

### 5.1 Start your servers

1. Start the backend server:
   ```bash
   npm run server:dev
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 5.2 Test Google Login

1. Navigate to `http://localhost:5173/login`
2. Click the "Continue with Google" button
3. You should see the Google OAuth popup
4. Sign in with your Google account
5. You should be redirected to the home page

### 5.3 Verify in Database

Check your MongoDB database to see if the user was created with Google authentication data.

## Step 6: Production Deployment

When deploying to production:

1. **Update Google Cloud Console:**
   - Add your production domain to authorized origins
   - Add your production domain to authorized redirect URIs

2. **Update environment variables:**
   - Set `VITE_GOOGLE_CLIENT_ID` in your production environment
   - Update API URLs in the Google auth service if needed

3. **Security considerations:**
   - Use HTTPS in production
   - Implement proper CORS settings
   - Consider implementing token refresh logic
   - Add rate limiting to auth endpoints

## Troubleshooting

### Common Issues

1. **"Invalid client" error:**
   - Check that your Client ID is correct in the `.env` file
   - Ensure you've added the correct origins in Google Cloud Console

2. **CORS errors:**
   - Make sure your backend CORS settings allow your frontend domain
   - Check that the API URL in the auth service is correct

3. **"Unauthorized" errors:**
   - Verify that the JWT secret is set in your backend config
   - Check that the auth routes are properly registered

4. **Database connection issues:**
   - Ensure MongoDB is running and accessible
   - Check your MongoDB connection string

### Debug Steps

1. Check browser console for errors
2. Check backend server logs
3. Verify environment variables are loaded correctly
4. Test API endpoints directly with tools like Postman

## Security Best Practices

1. **Never expose your Google Client Secret** in frontend code
2. **Always use HTTPS** in production
3. **Implement proper token expiration** and refresh logic
4. **Validate tokens on the backend** for sensitive operations
5. **Use environment variables** for all sensitive configuration
6. **Implement rate limiting** on authentication endpoints
7. **Log authentication events** for security monitoring

## Additional Features to Consider

1. **Account linking:** Allow users to link Google auth with existing email accounts
2. **Multi-factor authentication:** Add additional security layers
3. **Session management:** Implement proper session handling
4. **User profile management:** Allow users to update their profiles
5. **Admin panel:** Create admin interface for user management

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Check the backend server logs
3. Verify your Google Cloud Console configuration
4. Ensure all environment variables are set correctly

For additional help, refer to:
- [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google documentation](https://github.com/MomenSherif/react-oauth)
