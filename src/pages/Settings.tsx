import React, { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { handleError } from '@/lib/error-handler';
import { useTheme } from '@/components/theme-provider';
import config from '@/config';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    notifications: true,
    emailUpdates: true,
    autoSave: true,
    darkMode: theme === 'dark',
  });


  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    deleteConfirmation: '',
  });

  // Handle general settings save
  const handleSaveGeneralSettings = async () => {
    try {
      setIsLoading(true);

      // In a real app, this would be an API call
      // await settings.saveGeneral(generalSettings);

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update theme based on darkMode setting
      setTheme(generalSettings.darkMode ? 'dark' : 'light');

      toast.success('General settings saved successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };


  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);

      // Validate confirmation
      if (accountSettings.deleteConfirmation !== 'DELETE') {
        toast.error('Please type DELETE to confirm account deletion');
        return;
      }

      // In a real app, this would be an API call
      // await account.delete();

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Account deleted successfully');

      // Clear local storage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle data reset
  const handleResetData = async () => {
    try {
      setIsLoading(true);

      // In a real app, this would be an API call
      // await data.reset();

      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      toast.success('All data has been reset successfully');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and account settings
        </p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your content
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={generalSettings.notifications}
                  onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-updates">Email Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch
                  id="email-updates"
                  checked={generalSettings.emailUpdates}
                  onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, emailUpdates: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your content as you type
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={generalSettings.autoSave}
                  onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the application
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={generalSettings.darkMode}
                  onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, darkMode: checked }))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveGeneralSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>



        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reset Data</CardTitle>
              <CardDescription>
                Reset all your content and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This will delete all your content, drafts, and scheduled posts. This action cannot be undone.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={handleResetData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset All Data
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-destructive">
            <CardHeader className="text-destructive">
              <CardTitle>Delete Account</CardTitle>
              <CardDescription className="text-destructive/80">
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-3 rounded-md bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive mr-3" />
                <p className="text-sm text-destructive">
                  This action is irreversible. All your data will be permanently deleted.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delete-confirmation" className="text-destructive">
                  Type DELETE to confirm
                </Label>
                <Input
                  id="delete-confirmation"
                  placeholder="DELETE"
                  value={accountSettings.deleteConfirmation}
                  onChange={(e) => setAccountSettings(prev => ({ ...prev, deleteConfirmation: e.target.value }))}
                  className="border-destructive"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading || accountSettings.deleteConfirmation !== 'DELETE'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
