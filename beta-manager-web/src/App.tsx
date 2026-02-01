import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { PublicFeedbackPage } from './pages/PublicFeedbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { TestersPage } from './pages/TestersPage';
import { TesterDetailPage } from './pages/TesterDetailPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { IncidentsPage } from './pages/IncidentsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/public/feedback" element={<PublicFeedbackPage />} />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/testers"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TestersPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/testers/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TesterDetailPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FeedbackPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <IncidentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
