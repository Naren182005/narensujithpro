/**
 * Global Error Handler
 * 
 * This module provides centralized error handling functionality for the application.
 * It includes error logging, formatting, and user-friendly error messages.
 */

import { toast } from '@/components/ui/sonner';
import { AxiosError } from 'axios';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

// Error interface
export interface AppError {
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  originalError?: any;
  timestamp: Date;
  code?: string;
  context?: Record<string, any>;
}

/**
 * Creates a formatted error object
 */
export const createError = (
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  originalError?: any,
  context?: Record<string, any>,
): AppError => {
  return {
    message,
    severity,
    category,
    originalError,
    timestamp: new Date(),
    context,
    code: originalError?.code,
  };
};

/**
 * Handles API errors and returns a formatted error object
 */
export const handleApiError = (error: any): AppError => {
  console.error('API Error:', error);

  // Handle Axios errors
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    
    // Network errors
    if (!axiosError.response) {
      return createError(
        'Unable to connect to the server. Please check your internet connection and try again.',
        ErrorSeverity.ERROR,
        ErrorCategory.NETWORK,
        error
      );
    }

    // Handle different status codes
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;
    
    // Authentication errors (401)
    if (status === 401) {
      return createError(
        data?.message || 'Your session has expired. Please log in again.',
        ErrorSeverity.WARNING,
        ErrorCategory.AUTHENTICATION,
        error
      );
    }
    
    // Authorization errors (403)
    if (status === 403) {
      return createError(
        data?.message || 'You do not have permission to perform this action.',
        ErrorSeverity.WARNING,
        ErrorCategory.AUTHORIZATION,
        error
      );
    }
    
    // Validation errors (400)
    if (status === 400) {
      return createError(
        data?.message || 'The request contains invalid data. Please check your inputs and try again.',
        ErrorSeverity.WARNING,
        ErrorCategory.VALIDATION,
        error,
        { validationErrors: data?.errors }
      );
    }
    
    // Server errors (500)
    if (status >= 500) {
      return createError(
        data?.message || 'The server encountered an error. Please try again later.',
        ErrorSeverity.ERROR,
        ErrorCategory.SERVER,
        error
      );
    }
    
    // Other HTTP errors
    return createError(
      data?.message || `Request failed with status code ${status}`,
      ErrorSeverity.ERROR,
      ErrorCategory.UNKNOWN,
      error
    );
  }
  
  // Handle other types of errors
  return createError(
    error.message || 'An unexpected error occurred',
    ErrorSeverity.ERROR,
    ErrorCategory.UNKNOWN,
    error
  );
};

/**
 * Displays an error notification to the user
 */
export const notifyError = (error: AppError): void => {
  // Log the error to the console with additional context
  console.group(`Error: ${error.category} (${error.severity})`);
  console.error(error.message);
  console.error('Original error:', error.originalError);
  console.error('Context:', error.context);
  console.error('Timestamp:', error.timestamp);
  console.groupEnd();
  
  // Show a toast notification based on severity
  switch (error.severity) {
    case ErrorSeverity.INFO:
      toast.info(error.message);
      break;
    case ErrorSeverity.WARNING:
      toast.warning(error.message);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      toast.error(error.message);
      break;
    default:
      toast.error(error.message);
  }
  
  // For critical errors, you might want to do additional handling
  if (error.severity === ErrorSeverity.CRITICAL) {
    // For example, redirect to an error page or force a refresh
    // window.location.href = '/error';
  }
};

/**
 * Global error handler function that can be used throughout the application
 */
export const handleError = (error: any, context?: Record<string, any>): AppError => {
  const appError = error.category ? error : handleApiError(error);
  
  // Add additional context if provided
  if (context) {
    appError.context = { ...appError.context, ...context };
  }
  
  // Display the error to the user
  notifyError(appError);
  
  return appError;
};
