/**
 * React Error Boundary component
 * Catches and handles errors in the component tree gracefully
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { logger } from '@/services/logger';

/**
 * Props for ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional custom error fallback render function */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

/**
 * State for ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error object */
  error: Error | null;
}

/**
 * Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the entire application
 * Includes error reporting integration point for production monitoring
 *
 * Features:
 * - Graceful error handling
 * - User-friendly error UI
 * - Reset functionality to retry
 * - Development mode error details
 * - Production error tracking integration point
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Error caught by boundary', {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
    }, error);

    // In production, you would send this to an error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Une erreur est survenue</h1>
              <p className="text-muted-foreground mb-4">
                Nous sommes désolés, quelque chose s'est mal passé. Veuillez essayer de rafraîchir la page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-4 p-4 bg-slate-100 rounded text-left">
                  <p className="text-xs font-mono text-slate-700 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={this.resetError} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full"
              >
                <a href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
