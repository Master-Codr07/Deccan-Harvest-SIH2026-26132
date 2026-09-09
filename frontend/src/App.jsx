import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import DealerDashboard from './pages/DealerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import GovDashboard from './pages/GovDashboard';
import TransportPage from './pages/TransportPage';
import WarehousePage from './pages/WarehousePage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role === 'apmc_officer' ? 'officer' : user.role}`} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/farmer" element={<ProtectedRoute roles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
      <Route path="/dealer" element={<ProtectedRoute roles={['dealer']}><DealerDashboard /></ProtectedRoute>} />
      <Route path="/officer" element={<ProtectedRoute roles={['apmc_officer']}><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin', 'apmc_officer']}><GovDashboard /></ProtectedRoute>} />
      <Route path="/transport" element={<ProtectedRoute><TransportPage /></ProtectedRoute>} />
      <Route path="/warehouse" element={<ProtectedRoute><WarehousePage /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
