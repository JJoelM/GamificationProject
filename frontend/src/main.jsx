import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './styles/theme.css';
import './styles/animations.css';

import App from './App.jsx';

/**
 * QueryClient — Configuración global de React Query
 *
 * · staleTime: 60s (los datos del servidor no se re-fetchen en cada mount)
 * · retry: 1 (reintenta una vez en caso de error de red)
 * · refetchOnWindowFocus: false (evita re-fetches agresivos en dev)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
