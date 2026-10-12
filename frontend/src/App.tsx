import { DesktopTitleBar } from './shared/components/DesktopTitleBar/DesktopTitleBar';
import { usePlatform } from './shared/hooks/usePlatform';
import './App.css'
import '@/core/i18n/i18n';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from './core/auth/AuthProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './store/queryClient';
import { ThemeProvider } from './core/theme/ThemeProvider';

function App() {
  const platform = usePlatform();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {(platform === 'windows' || platform === 'macos' || platform === 'linux') && (
            <DesktopTitleBar />
          )}
          {/* only render on desktop */}

          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
