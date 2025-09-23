import { useState, useCallback } from 'react';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
}

interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: Error | string) => void;
  clearError: () => void;
  retryAction: (action: () => Promise<void> | void) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: ''
  });

  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    const message = getErrorMessage(errorObj);
    
    setErrorState({
      hasError: true,
      error: errorObj,
      errorMessage: message
    });

    // Log error for debugging
    console.error('Error handled:', errorObj);
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: ''
    });
  }, []);

  const retryAction = useCallback(async (action: () => Promise<void> | void) => {
    try {
      clearError();
      await action();
    } catch (error) {
      handleError(error as Error);
    }
  }, [clearError, handleError]);

  return {
    errorState,
    handleError,
    clearError,
    retryAction
  };
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error: Error): string => {
  // Network errors
  if (error.message.includes('Network')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  // API errors
  if (error.message.includes('404')) {
    return 'Attendance data not found for the selected date.';
  }
  
  if (error.message.includes('401')) {
    return 'Authentication failed. Please log in again.';
  }
  
  if (error.message.includes('403')) {
    return 'You do not have permission to access this data.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error occurred. Please try again later.';
  }
  
  // Timeout errors
  if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};