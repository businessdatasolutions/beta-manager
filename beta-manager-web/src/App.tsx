import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
          <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
          <Route path="/" element={<div>Dashboard (Coming Soon)</div>} />
          <Route path="/testers" element={<div>Testers Page (Coming Soon)</div>} />
          <Route path="/testers/:id" element={<div>Tester Detail (Coming Soon)</div>} />
          <Route path="/feedback" element={<div>Feedback Page (Coming Soon)</div>} />
          <Route path="/incidents" element={<div>Incidents Page (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
