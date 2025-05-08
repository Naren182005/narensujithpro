import React, { useState, useEffect } from 'react';
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlatformType } from '@/components/SocialAuthButton';
import SocialAccountForm from '@/components/SocialAccountForm';
import { getAuthStatus, logout } from '@/lib/social-api';

// Platform icons
const platformIcons = {
  linkedin: Linkedin,
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

// Platform colors
const platformColors = {
  linkedin: 'bg-[#0a66c2]',
  instagram: 'bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
  twitter: 'bg-[#1DA1F2]',
  facebook: 'bg-[#1877f2]',
  youtube: 'bg-[#ff0000]',
};

// Platform names
const platformNames = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'Twitter',
  facebook: 'Facebook',
  youtube: 'YouTube',
};

interface SocialAccountsManagerProps {
  onAccountsChange: (accounts: Record<PlatformType, any[]>) => void;
}

const SocialAccountsManager: React.FC<SocialAccountsManagerProps> = ({
  onAccountsChange
}) => {
  const [activeTab, setActiveTab] = useState<PlatformType>('linkedin');
  const [accounts, setAccounts] = useState<Record<PlatformType, any[]>>({
    linkedin: [],
    instagram: [],
    facebook: [],
    youtube: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const platforms: PlatformType[] = ['linkedin', 'instagram', 'facebook', 'youtube'];

  // Load accounts from localStorage on mount
  useEffect(() => {
    const loadAccounts = () => {
      try {
        const savedAccounts = localStorage.getItem('socialAccounts');
        if (savedAccounts) {
          const parsedAccounts = JSON.parse(savedAccounts);
          setAccounts(parsedAccounts);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading accounts from localStorage:', error);
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // Save accounts to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('socialAccounts', JSON.stringify(accounts));
      onAccountsChange(accounts);
    }
  }, [accounts, isLoading, onAccountsChange]);

  // Handle adding a new account
  const handleAddAccount = (platform: PlatformType, accountData: any) => {
    setAccounts(prev => ({
      ...prev,
      [platform]: [...prev[platform], accountData]
    }));

    setIsAddDialogOpen(false);
  };

  // Handle editing an account
  const handleEditAccount = (platform: PlatformType, accountData: any) => {
    setAccounts(prev => ({
      ...prev,
      [platform]: prev[platform].map(account =>
        account.accountId === accountData.accountId ? accountData : account
      )
    }));

    setSelectedAccount(null);
    setIsAddDialogOpen(false);
  };

  // Handle deleting an account
  const handleDeleteAccount = async (platform: PlatformType, accountId: string) => {
    setIsDeleting(accountId);

    try {
      // If the account is connected, disconnect it first
      const accountToDelete = accounts[platform].find(account => account.accountId === accountId);
      if (accountToDelete && accountToDelete.connected) {
        await logout(platform);
      }

      // Remove the account from the list
      setAccounts(prev => ({
        ...prev,
        [platform]: prev[platform].filter(account => account.accountId !== accountId)
      }));

      toast.success(`${platformNames[platform]} account removed successfully`);
    } catch (error) {
      console.error(`Error deleting ${platform} account:`, error);
      toast.error(`Failed to remove ${platformNames[platform]} account`);
    } finally {
      setIsDeleting(null);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Count total accounts
  const totalAccounts = Object.values(accounts).reduce((sum, platformAccounts) => sum + platformAccounts.length, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Social Media Accounts</CardTitle>
            <CardDescription>Manage your connected social media accounts</CardDescription>
          </div>
          <Badge variant="outline">
            {totalAccounts} {totalAccounts === 1 ? 'Account' : 'Accounts'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PlatformType)}>
            <TabsList className="grid grid-cols-4 mb-4">
              {platforms.map(platform => (
                <TabsTrigger key={platform} value={platform} className="flex items-center gap-2">
                  {React.createElement(platformIcons[platform], { className: 'h-4 w-4' })}
                  <span className="hidden md:inline">{platformNames[platform]}</span>
                  {accounts[platform].length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {accounts[platform].length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {platforms.map(platform => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                {accounts[platform].length === 0 ? (
                  <div className="text-center py-8 border rounded-lg border-dashed">
                    <p className="text-muted-foreground mb-4">No {platformNames[platform]} accounts connected</p>
                    <Button
                      onClick={() => {
                        setSelectedAccount(null);
                        setActiveTab(platform);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {platformNames[platform]} Account
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">{platformNames[platform]} Accounts</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(null);
                          setActiveTab(platform);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {accounts[platform].map(account => (
                        <div key={account.accountId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={account.profileImage} alt={account.displayName} />
                              <AvatarFallback className={platformColors[platform]}>
                                {getInitials(account.displayName)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="font-medium">{account.displayName}</div>
                              <div className="text-sm text-muted-foreground">@{account.username}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={account.connected ? "default" : "outline"}>
                              {account.connected ? "Connected" : "Disconnected"}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedAccount(account);
                                setActiveTab(platform);
                                setIsAddDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAccount(platform, account.accountId)}
                              disabled={isDeleting === account.accountId}
                            >
                              {isDeleting === account.accountId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAccount ? `Edit ${platformNames[activeTab]} Account` : `Add ${platformNames[activeTab]} Account`}
            </DialogTitle>
            <DialogDescription>
              {selectedAccount
                ? `Update your ${platformNames[activeTab]} account details`
                : `Connect your ${platformNames[activeTab]} account to post content`}
            </DialogDescription>
          </DialogHeader>

          <SocialAccountForm
            platform={activeTab}
            onAccountAdded={selectedAccount ? handleEditAccount : handleAddAccount}
            existingAccount={selectedAccount}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SocialAccountsManager;
