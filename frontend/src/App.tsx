import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Mood from '@/pages/Mood';
import Wellness from '@/pages/Wellness';
import Chat from '@/pages/Chat';
import Crisis from '@/pages/Crisis';
import Settings from '@/pages/Settings';
import WellnessGames from '@/pages/WellnessGames';
import Community from '@/pages/Community';
import OnboardingModal from '@/components/OnboardingModal';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <OnboardingModal />
      {children}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="mood" element={<Mood />} />
              <Route path="wellness" element={<Wellness />} />
              <Route path="wellness/games" element={<WellnessGames />} />
              <Route path="chat" element={<Chat />} />
              <Route path="crisis" element={<Crisis />} />
              <Route path="community" element={<Community />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
