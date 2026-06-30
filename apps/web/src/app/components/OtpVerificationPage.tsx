import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';

export function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || '';

  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const id = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(id);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').match(/\d/g);
    if (digits) {
      const newOtp = digits.slice(0, 6).concat(['', '', '', '', '', '']).slice(0, 6);
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const password = location.state?.password || '';
      await authService.register({ email, password });
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch { setError('Failed to resend OTP'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('').slice(0, 6);
    if (otpValue.length < 4) { setError('Please enter the complete OTP'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyOtp({ name: formData.name, email, phone: formData.phone, otp: otpValue });
      const { access_token, player } = res.data;
      login(access_token, player);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/[0.015] blur-[110px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Register
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            ARENA<span className="text-emerald-600 font-black">BOOK</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">Verify your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/60 border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Verify OTP</h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            OTP sent to <span className="font-bold text-slate-700">{email}</span>
          </p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-600 font-medium">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="name" type="text" placeholder="John Doe" className="pl-10 focus-visible:ring-emerald-500"
                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-600 font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="phone" type="tel" placeholder="9876543210" className="pl-10 focus-visible:ring-emerald-500"
                  value={formData.phone}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setFormData({ ...formData, phone: v }); }}
                  required maxLength={10} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Enter OTP</Label>
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-slate-200 focus-visible:ring-emerald-500"
                  />
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              {!canResend ? (
                <p className="text-xs text-slate-400 font-medium">
                  Resend in <span className="font-semibold text-emerald-600">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                </p>
              ) : (
                <button type="button" onClick={handleResend} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                  Resend OTP
                </button>
              )}
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/10 cursor-pointer" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete Registration'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Email: <span className="font-bold text-slate-700">{email}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
