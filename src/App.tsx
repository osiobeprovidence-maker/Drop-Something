import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { CreatorPage } from './pages/CreatorPage';
import { SetupProfile } from './pages/SetupProfile';
import { EditProfile } from './pages/EditProfile';
import { KYC } from './pages/KYC';
import { Explore } from './pages/Explore';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Toaster } from 'sonner';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  
  // If user is logged in but has no profile, and they are not on the setup page, redirect to setup
  if (!profile && location.pathname !== '/setup') {
    return <Navigate to="/setup" />;
  }

  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/setup" element={<PrivateRoute><SetupProfile /></PrivateRoute>} />
            <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
            <Route path="/kyc" element={<PrivateRoute><KYC /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
            <Route path="/:username" element={<CreatorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
