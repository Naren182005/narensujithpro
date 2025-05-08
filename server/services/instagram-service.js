/**
 * Instagram API service for verifying credentials and interacting with Instagram
 * 
 * Note: This is a simulated service. In a real application, you would use
 * Instagram's official API or a third-party library to authenticate users.
 */

/**
 * Verify Instagram credentials
 * @param {string} username - Instagram username
 * @param {string} password - Instagram password
 * @returns {Promise<{success: boolean, message: string}>} Result of verification
 */
async function verifyCredentials(username, password) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real application, you would call Instagram's API to verify credentials
  // For this simulation, we'll consider some test accounts as valid
  
  // Test accounts (in a real app, you would never hardcode these)
  const validAccounts = [
    { username: 'test_user', password: 'password123' },
    { username: 'instagram_test', password: 'test1234' },
    // For demo purposes, accept any username with password matching "password123" + first 3 chars of username
    // This allows testing with different usernames
  ];
  
  // Check if credentials match any test account
  const isValid = validAccounts.some(account => 
    account.username === username && account.password === password
  );
  
  // Also accept any username with password matching "password123" + first 3 chars of username
  const dynamicPasswordValid = password === `password123${username.substring(0, 3)}`;
  
  if (isValid || dynamicPasswordValid) {
    return {
      success: true,
      message: 'Credentials verified successfully'
    };
  }
  
  // Log the attempt for debugging
  console.log(`Failed login attempt for Instagram account: ${username}`);
  
  return {
    success: false,
    message: 'Invalid username or password'
  };
}

/**
 * Get basic profile information
 * @param {string} username - Instagram username
 * @returns {Promise<Object>} Profile information
 */
async function getProfileInfo(username) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock profile data
  return {
    username,
    fullName: username.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    followers: Math.floor(Math.random() * 10000),
    following: Math.floor(Math.random() * 1000),
    postsCount: Math.floor(Math.random() * 100),
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    isPrivate: Math.random() > 0.7,
    isVerified: Math.random() > 0.9,
  };
}

module.exports = {
  verifyCredentials,
  getProfileInfo
};
