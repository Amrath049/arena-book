import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { bookingService } from '@/services/booking.service';
import { walletService } from '@/services/wallet.service';

export function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [walletBalance, setWalletBalance] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    walletService.getWallet().then(r => setWalletBalance(r.data?.walletBalance ?? 0)).catch(() => {});
  }, []);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4 font-semibold">No booking data found</p>
          <Button onClick={() => navigate('/arenas')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">Browse Arenas</Button>
        </div>
      </div>
    );
  }

  const { arenaId, arenaName, courtId, courtName, date, startTime, endTime, price } = bookingData;

  const handleConfirm = async () => {
    if (walletBalance < price) { setError('Insufficient wallet balance. Please add money to your wallet.'); return; }
    setProcessing(true);
    setError('');
    try {
      await bookingService.createBooking({ courtId, arenaId, date, startTime, endTime, price });
      setBooked(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-emerald-500/[0.02] blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/[0.015] blur-[110px] rounded-full pointer-events-none" />

        <Card className="max-w-md w-full relative z-10 border-slate-100 bg-white shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Booking Confirmed!</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">Your slot has been successfully booked. See you at the arena!</p>
            <div className="space-y-3">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>View My Bookings</Button>
              <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 relative overflow-hidden flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-lg mx-auto w-full flex-grow relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-semibold cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Confirm Booking</h1>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">{error}</div>}

        <Card className="mb-4 border-slate-100 bg-white shadow-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">{arenaName}</h3>
            <div className="space-y-2.5 text-sm font-medium">
              <div className="flex justify-between text-slate-500">
                <span>Court</span>
                <span className="font-bold text-slate-800">{courtName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Date</span>
                <span className="font-bold text-slate-800">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Time Slot</span>
                <span className="font-bold text-slate-800">{startTime} – {endTime}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center font-bold">
                <span className="text-slate-700">Total Amount</span>
                <span className="text-emerald-600 text-xl font-extrabold">₹{price}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-slate-100 bg-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Pay from Wallet</p>
                <p className="text-xs text-slate-400 font-medium">Available balance: ₹{walletBalance}</p>
              </div>
            </div>
            {walletBalance < price && (
              <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold leading-relaxed">
                Insufficient balance. You need ₹{price - walletBalance} more.{' '}
                <button onClick={() => navigate('/dashboard')} className="underline font-bold text-amber-800 hover:text-amber-900 cursor-pointer">Add money</button>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleConfirm} disabled={processing || walletBalance < price}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-base font-bold shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50">
          {processing ? 'Processing...' : `Confirm & Pay ₹${price}`}
        </Button>
      </div>
    </div>
  );
}
