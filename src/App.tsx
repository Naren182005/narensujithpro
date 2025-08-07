import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from '@/components/theme-provider';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppLayout from '@/components/layout/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';

// Eager loaded components
import Login from "./pages/Login";
import CleanLogin from "./pages/CleanLogin";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import Index from "./pages/Index";

// Lazy-loaded components for better performance
// const Index = lazy(() => import('./pages/Index'));
const Account = lazy(() => import('./pages/Account'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Summarize = lazy(() => import('./pages/Summarize'));

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="socialmuse-theme">
        <HelmetProvider>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<Loading />}>
                <Routes>
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth-success" element={<AuthCallback />} />
                <Route path="/auth-error" element={<AuthCallback />} />

                {/* App routes */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Index />} />
                  <Route path="account" element={<Account />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="summarize" element={<Summarize />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </HelmetProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
