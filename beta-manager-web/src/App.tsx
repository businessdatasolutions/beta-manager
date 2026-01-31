import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TestersPage } from './pages/TestersPage';
import { TesterDetailPage } from './pages/TesterDetailPage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Placeholder components for protected pages
function FeedbackPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Feedback</h1>
      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
          <CardDescription>Coming in Phase 16</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Review and manage feedback submitted by your beta testers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function IncidentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Incidents</h1>
      <Card>
        <CardHeader>
          <CardTitle>Incident Tracking</CardTitle>
          <CardDescription>Coming in Phase 16</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Track and resolve incidents reported during beta testing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

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
