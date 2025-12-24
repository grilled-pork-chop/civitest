import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from './router';
import { queryClient } from './lib/queries';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Root application component
 * Sets up error boundary, query client, router, and toast notifications
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
