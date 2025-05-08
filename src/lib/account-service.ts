import { PlatformType } from '@/components/SocialAuthButton';
import { toast } from 'sonner';

/**
 * Get all connected social media accounts
 * @returns Record of platform to accounts
 */
export function getConnectedAccounts(): Record<PlatformType, any[]> {
  try {
    const savedAccounts = localStorage.getItem('socialAccounts');
    if (savedAccounts) {
      return JSON.parse(savedAccounts);
    }

    return {
      linkedin: [],
      instagram: [],
      twitter: [],
      facebook: [],
      youtube: [],
    };
  } catch (error) {
    console.error('Error loading accounts from localStorage:', error);
    return {
      linkedin: [],
      instagram: [],
      twitter: [],
      facebook: [],
      youtube: [],
    };
  }
}

/**
 * Get connected accounts for a specific platform
 * @param platform The platform to get accounts for
 * @returns Array of connected accounts
 */
export function getPlatformAccounts(platform: PlatformType): any[] {
  const accounts = getConnectedAccounts();
  return accounts[platform] || [];
}

/**
 * Check if a platform has any connected accounts
 * @param platform The platform to check
 * @returns True if the platform has connected accounts
 */
export function hasPlatformAccounts(platform: PlatformType): boolean {
  const accounts = getPlatformAccounts(platform);
  return accounts.length > 0 && accounts.some(account => account.connected);
}

/**
 * Get the default account for a platform
 * @param platform The platform to get the default account for
 * @returns The default account or null if none exists
 */
export function getDefaultAccount(platform: PlatformType): any | null {
  const accounts = getPlatformAccounts(platform);
  if (accounts.length === 0) {
    return null;
  }

  // Return the first connected account, or the first account if none are connected
  const connectedAccount = accounts.find(account => account.connected);
  return connectedAccount || accounts[0];
}

/**
 * Post content to a platform using a connected account
 * @param platform The platform to post to
 * @param content The content to post
 * @param accountId Optional account ID to use (uses default if not provided)
 * @returns Promise with the result of the post
 */
export async function postWithAccount(platform: PlatformType, content: string | object, accountId?: string): Promise<any> {
  try {
    // Get the account to use
    let account;
    if (accountId) {
      const accounts = getPlatformAccounts(platform);
      account = accounts.find(acc => acc.accountId === accountId);
      if (!account) {
        throw new Error(`Account with ID ${accountId} not found for ${platform}`);
      }
    } else {
      account = getDefaultAccount(platform);
      if (!account) {
        throw new Error(`No accounts found for ${platform}`);
      }
    }

    // Check if the account is connected
    if (!account.connected) {
      throw new Error(`Account ${account.username} is not connected to ${platform}`);
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a fake post ID
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Generate a fake post URL
    const postUrl = `https://${platform}.com/${account.username}/posts/${postId}`;

    // Return success response
    return {
      success: true,
      platform,
      account: {
        username: account.username,
        displayName: account.displayName,
        accountId: account.accountId,
      },
      postId,
      postUrl,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    throw error;
  }
}

/**
 * Post content to multiple platforms using connected accounts
 * @param platformsContent Object mapping platforms to content
 * @param accountIds Optional object mapping platforms to account IDs
 * @returns Promise with the results for each platform
 */
export async function postToMultipleWithAccounts(
  platformsContent: Record<PlatformType, string | object>,
  accountIds?: Record<PlatformType, string>
): Promise<Record<PlatformType, any>> {
  const results: Record<string, any> = {};

  // Post to each platform in parallel
  const postPromises = Object.entries(platformsContent).map(async ([platform, content]) => {
    try {
      const accountId = accountIds?.[platform as PlatformType];
      const result = await postWithAccount(platform as PlatformType, content, accountId);
      results[platform] = result;
    } catch (error) {
      console.error(`Error posting to ${platform}:`, error);
      results[platform] = {
        success: false,
        platform,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  await Promise.all(postPromises);

  return results as Record<PlatformType, any>;
}
