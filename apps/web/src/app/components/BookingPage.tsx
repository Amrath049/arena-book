import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Label } from '@/app/components/ui/label';

export function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const walletBalance = 1100;

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No booking data found</p>
      </div>
    );
  }

  const { arena, sport, date, slot, price } = bookingData;

  const handleConfirmBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsBooked(true);
    }, 1500);
  };

  if (isBooked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your slot has been successfully booked. See you at the arena!
            </p>
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => navigate('/dashboard')}
              >
                View My Bookings
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Confirm Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Arena</span>
                  <span className="font-semibold">{arena.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold">
                    {arena.location}, {arena.city}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Sport</span>
                  <span className="font-semibold">{sport}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">
                    {new Date(date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Time Slot</span>
                  <span className="font-semibold">{slot}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">1 hour</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 mb-3">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label
                      htmlFor="wallet"
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">ArenaBook Wallet</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Balance: ₹{walletBalance}
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-4">
                    <RadioGroupItem value="online" id="online" />
                    <Label
                      htmlFor="online"
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Pay Online</span>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'wallet' && walletBalance < price && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      Insufficient wallet balance. Please recharge your wallet or choose online payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Slot Price (1 hr)</span>
                  <span>₹{price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹0</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">₹{price}</span>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleConfirmBooking}
                  disabled={
                    isProcessing ||
                    (paymentMethod === 'wallet' && walletBalance < price)
                  }
                >
                  {isProcessing ? 'Processing...' : 'Confirm Booking'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By confirming, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
