import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { Layout } from '@/app/components/Layout';
import { Login, Register, VerifyOTP } from '@/app/pages';
import { Dashboard } from '@/app/pages/Dashboard';
import { ArenaManagement } from '@/app/pages/ArenaManagement';
import { GamesManagement } from '@/app/pages/GamesManagement';
import { SlotsAndPricing } from '@/app/pages/SlotsAndPricing';
import { Bookings } from '@/app/pages/Bookings';
import { AdminBookSlot } from '@/app/pages/AdminBookSlot';
import { Players } from '@/app/pages/Players';
import { Transactions } from '@/app/pages/Transactions';
import { Settings } from '@/app/pages/Settings';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public authentication routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />
      <Route 
        path="/verify-otp" 
        element={<VerifyOTP />} 
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/arena"
        element={
          isAuthenticated ? (
            <Layout>
              <ArenaManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/games"
        element={
          isAuthenticated ? (
            <Layout>
              <GamesManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/slots"
        element={
          isAuthenticated ? (
            <Layout>
              <SlotsAndPricing />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/bookings"
        element={
          isAuthenticated ? (
            <Layout>
              <Bookings />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin-book-slot"
        element={
          isAuthenticated ? (
            <Layout>
              <AdminBookSlot />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/players"
        element={
          isAuthenticated ? (
            <Layout>
              <Players />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/transactions"
        element={
          isAuthenticated ? (
            <Layout>
              <Transactions />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Layout>
              <Settings />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;