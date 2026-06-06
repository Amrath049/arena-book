import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Header } from '@/app/components/Header';
import { HomePage } from '@/app/components/HomePage';
import { ArenaListingPage } from '@/app/components/ArenaListingPage';
import { ArenaDetailPage } from '@/app/components/ArenaDetailPage';
import { BookingPage } from '@/app/components/BookingPage';
import { DashboardPage } from '@/app/components/DashboardPage';
import { LoginPage } from '@/app/components/LoginPage';
import { RegisterPage } from '@/app/components/RegisterPage';
import { OtpVerificationPage } from '@/app/components/OtpVerificationPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/arenas" element={<ArenaListingPage />} />
        <Route path="/arena/:id" element={<ArenaDetailPage />} />
        <Route
          path="/booking"
          element={<ProtectedRoute><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
