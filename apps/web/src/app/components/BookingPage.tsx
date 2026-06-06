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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking data found</p>
          <Button onClick={() => navigate('/arenas')}>Browse Arenas</Button>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your slot has been booked. See you at the arena!</p>
            <div className="space-y-2">
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/dashboard')}>View My Bookings</Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-lg">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-2xl font-bold mb-6">Confirm Booking</h1>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <Card className="mb-4">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold text-lg">{arenaName}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Court</span><span className="font-medium text-gray-900">{courtName}</span></div>
              <div className="flex justify-between text-gray-600"><span>Date</span><span className="font-medium text-gray-900">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
              <div className="flex justify-between text-gray-600"><span>Time</span><span className="font-medium text-gray-900">{startTime} – {endTime}</span></div>
              <div className="border-t pt-3 flex justify-between font-semibold"><span>Total Amount</span><span className="text-green-600 text-lg">₹{price}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Pay from Wallet</p>
                <p className="text-sm text-gray-500">Available balance: ₹{walletBalance}</p>
              </div>
            </div>
            {walletBalance < price && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                Insufficient balance. You need ₹{price - walletBalance} more.{' '}
                <button onClick={() => navigate('/dashboard')} className="underline font-medium">Add money</button>
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleConfirm} disabled={processing || walletBalance < price}
          className="w-full bg-green-600 hover:bg-green-700 py-3 text-base disabled:opacity-50">
          {processing ? 'Processing...' : `Confirm & Pay ₹${price}`}
        </Button>
      </div>
    </div>
  );
}
