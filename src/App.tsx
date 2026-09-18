import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { LoginPage, RegisterPage } from '@/pages/Auth';
import { AppLayout } from '@/components/AppLayout';
import { DashboardPage } from '@/pages/Dashboard';
import { ProjectsPage } from '@/pages/Projects';
import { ProjectDetailPage } from '@/pages/ProjectDetail';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

function PublicRoutes() {
  const { loading } = useAuth();
  if (loading) return <FullPageSpinner />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;

  return user ? <ProtectedRoutes /> : <PublicRoutes />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
