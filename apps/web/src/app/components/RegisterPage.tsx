import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { authService } from '@/services/auth.service';

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', agreeToTerms: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!formData.agreeToTerms) { setError('Please accept the terms and conditions'); return; }
    setLoading(true);
    setError('');
    try {
      await authService.register({ email: formData.email, password: formData.password });
      navigate('/verify-otp', { state: { email: formData.email, password: formData.password } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            ARENA<span className="text-emerald-600 font-black">BOOK</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/60 border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Create Account</h2>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-600 font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="john@example.com" className="pl-10 focus-visible:ring-emerald-500"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-600 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="min 6 chars" className="pl-10 pr-10 focus-visible:ring-emerald-500"
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-600 font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10 focus-visible:ring-emerald-500"
                  value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-1">
              <Checkbox id="terms" checked={formData.agreeToTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked === true })} className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 focus-visible:ring-emerald-500 mt-0.5" />
              <label htmlFor="terms" className="text-xs text-slate-500 leading-normal font-medium cursor-pointer select-none">
                I agree to the Terms & Conditions and Privacy Policy
              </label>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/10 cursor-pointer" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
