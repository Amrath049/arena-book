import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/app/components/Header';
import { HomePage } from '@/app/components/HomePage';
import { ArenaListingPage } from '@/app/components/ArenaListingPage';
import { ArenaDetailPage } from '@/app/components/ArenaDetailPage';
import { BookingPage } from '@/app/components/BookingPage';
import { DashboardPage } from '@/app/components/DashboardPage';
import { LoginPage } from '@/app/components/LoginPage';
import { RegisterPage } from '@/app/components/RegisterPage';
import { OtpVerificationPage } from '@/app/components/OtpVerificationPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/arenas" element={<ArenaListingPage />} />
          <Route path="/arena/:id" element={<ArenaDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
        </Routes>
      </div>
    </Router>
  );
}