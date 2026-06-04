import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Redirect to register if no email provided
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Timer countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    const digits = pastedData.match(/\d/g);

    if (digits) {
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 4) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastIndex = Math.min(digits.length, 3);
      inputRefs[lastIndex].current?.focus();
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    
    // TODO: Add actual resend OTP logic here
    console.log('Resending OTP to:', email);
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '']);
    inputRefs[0].current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      alert('Please enter the complete 4-digit OTP');
      return;
    }

    // TODO: Add actual OTP verification logic here
    console.log('Verify OTP:', {
      email,
      name: formData.name,
      phone: formData.phone,
      otp: otpValue,
    });

    // Navigate to dashboard after successful verification
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/register')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Register
        </button>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">ArenaBook</h1>
          <p className="text-gray-600">Verify your account</p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
          <p className="text-sm text-gray-600 mb-6">
            We've sent a 4-digit code to{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  required
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-gray-500">10-digit mobile number</p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <Label>Enter OTP</Label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-14 h-14 text-center text-2xl font-bold"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-600">
                  Resend OTP in{' '}
                  <span className="font-medium text-green-600">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm font-medium text-green-600 hover:text-green-700"
                >
                  Resend OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Verify & Complete Registration
            </Button>
          </form>

          {/* Email Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>Registered Email: <span className="font-medium text-gray-900">{email}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
