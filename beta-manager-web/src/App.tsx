import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Placeholder components for protected pages
function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Coming in Phase 14</p>
    </div>
  );
}

function TestersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Testers</h1>
      <p className="mt-2 text-gray-600">Coming in Phase 15</p>
    </div>
  );
}

function TesterDetailPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Tester Detail</h1>
      <p className="mt-2 text-gray-600">Coming in Phase 15</p>
    </div>
  );
}

function FeedbackPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Feedback</h1>
      <p className="mt-2 text-gray-600">Coming in Phase 16</p>
    </div>
  );
}

function IncidentsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Incidents</h1>
      <p className="mt-2 text-gray-600">Coming in Phase 16</p>
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

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/testers"
            element={
              <ProtectedRoute>
                <TestersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/testers/:id"
            element={
              <ProtectedRoute>
                <TesterDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentsPage />
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
