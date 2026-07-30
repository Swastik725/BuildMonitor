import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/Login';
import { OAuthSuccessPage } from './pages/OAuthSuccess';
import { DashboardPage } from './pages/Dashboard';
import { OrganizationsPage } from './pages/Organizations';
import { ProjectDetailPage } from './pages/ProjectDetail';
import { AllDeploymentsPage } from './pages/AllDeployments';
import { AllIncidentsPage } from './pages/AllIncidents';
import { SettingsPage } from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth-success" element={<OAuthSuccessPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/organizations" element={<ProtectedRoute><OrganizationsPage /></ProtectedRoute>} />
      <Route path="/deployments" element={<ProtectedRoute><AllDeploymentsPage /></ProtectedRoute>} />
      <Route path="/incidents" element={<ProtectedRoute><AllIncidentsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetailPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
