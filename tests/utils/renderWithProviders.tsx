import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient for each test
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/**
 * Custom render function that wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  function Wrapper({ children }: WrapperProps): ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Create a wrapper component with providers for testing hooks
 */
export function createWrapper(queryClient?: QueryClient): React.FC<WrapperProps> {
  const client = queryClient || createTestQueryClient();

  return function Wrapper({ children }: WrapperProps): ReactElement {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    );
  };
}

export { createTestQueryClient };
