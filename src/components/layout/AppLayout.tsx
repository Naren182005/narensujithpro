import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import config from '@/config';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  onClick?: () => void;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, onClick, active }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
    if (onClick) onClick();
  };

  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className="w-full justify-start"
      onClick={handleClick}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );
};

const AppLayout: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // Redirect to login if not authenticated (with a small delay to allow for state updates)
  useEffect(() => {
    if (!isAuthenticated && !isLoading && location.pathname !== '/login') {
      const timer = setTimeout(() => {
        if (!isAuthenticated && !isLoading && location.pathname !== '/login') {
          navigate('/login');
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: <Home className="h-4 w-4" />, label: 'Dashboard', path: '/' },
    { icon: <User className="h-4 w-4" />, label: 'Profile', path: '/profile' },
    { icon: <Settings className="h-4 w-4" />, label: 'Settings', path: '/settings' },
    { icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/><path d="M9 9h1"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>, label: 'Summarize', path: '/summarize' },
  ];

  const renderNavItems = (closeMenu?: () => void) => (
    <>
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          onClick={closeMenu}
          active={location.pathname === item.path}
        />
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => {
          handleLogout();
          if (closeMenu) closeMenu();
        }}
      >
        <LogOut className="h-4 w-4" />
        <span className="ml-2">Logout</span>
      </Button>
    </>
  );

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className="hidden md:flex w-64 flex-col border-r">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold">{config.appName}</h1>
              <ThemeToggle />
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-1">
                {renderNavItems()}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} {config.appName}
              </p>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">{config.appName}</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{config.appName}</h2>
                      <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-1">
                      {renderNavItems(() => setOpen(false))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;
