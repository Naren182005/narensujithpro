# Facebook OAuth Implementation

This document explains how the Facebook OAuth flow is implemented in this application.

## OAuth Flow Diagram

```
[User] → [Facebook OAuth Login Page] → [Your Redirect URI + code] → [Your Backend exchanges code for token] → [Use token for APIs]
```

## Step-by-Step Flow

1. **User clicks "Connect Facebook"**
   - Redirects to Facebook OAuth dialog:
   ```
   https://www.facebook.com/v19.0/dialog/oauth?
   client_id={your-app-id}
   &redirect_uri={your-redirect-url}
   &scope=email,public_profile
   &response_type=code
   ```

2. **Facebook redirects back to your redirect URI with a code**
   ```
   https://your-redirect-url?code=AUTH_CODE
   ```

3. **Backend exchanges code for an access token**
   - Endpoint: `POST https://graph.facebook.com/v19.0/oauth/access_token`
   - Required parameters:
     - `client_id`: Your Facebook App ID
     - `redirect_uri`: Same as before
     - `client_secret`: Your Facebook App secret
     - `code`: The code from step 2

4. **Use the access token to fetch user profile**
   - Endpoint: `GET https://graph.facebook.com/me`
   - Parameters:
     - `fields`: 'id,name,email,picture'
     - `access_token`: The access token from step 3

## Implementation Details

### Backend (Node.js with Express)

The backend handles the OAuth callback and exchanges the code for an access token:

```javascript
// Facebook OAuth Callback Route
app.get('/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }
  
  try {
    // Handle the Facebook OAuth callback
    const result = await socialAuthManager.handleAuthCallback('facebook', code);
    
    if (result.success) {
      // Redirect to the frontend with success
      res.redirect(`http://localhost:8080/auth-success?platform=facebook&token=${result.token}`);
    } else {
      // Redirect to the frontend with error
      res.redirect(`http://localhost:8080/auth-error?platform=facebook&error=${encodeURIComponent(result.error)}`);
    }
  } catch (error) {
    console.error('Error handling Facebook OAuth callback:', error);
    res.redirect(`http://localhost:8080/auth-error?platform=facebook&error=${encodeURIComponent(error.message)}`);
  }
});
```

### Frontend (React)

The frontend initiates the OAuth flow and handles the callback:

```typescript
// Initiate OAuth flow
if (platform === 'facebook') {
  // For Facebook, use real OAuth flow
  const authUrl = await getAuthUrl(platform);
  
  // Replace placeholders with actual values
  const url = authUrl
    .replace('[CLIENT_ID]', process.env.FACEBOOK_APP_ID || 'your-facebook-app-id')
    .replace('[REDIRECT_URI]', encodeURIComponent('http://localhost:3000/auth/facebook/callback'));
  
  // Open the authentication window
  window.location.href = url;
}
```

## Security Considerations

- The code exchange is performed on the backend to keep the app secret secure
- Access tokens are stored securely and not exposed to the client
- HTTPS is used for all API requests
- The redirect URI is validated by Facebook to prevent redirect attacks

## Configuration

Set the following environment variables in your `.env` file:

```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/auth/facebook/callback
```
