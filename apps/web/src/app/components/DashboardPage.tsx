import { useState, useEffect, useCallback } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Wallet, Heart, MapPin, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { ProfileCard } from '@/app/components/ProfileCard';
import { walletService } from '@/services/wallet.service';
import { bookingService } from '@/services/booking.service';
import { playerService } from '@/services/player.service';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { player } = useAuth();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txPages, setTxPages] = useState(1);
  const [txPage, setTxPage] = useState(1);

  const [bookings, setBookings] = useState<any[]>([]);
  const [bkPages, setBkPages] = useState(1);
  const [bkPage, setBkPage] = useState(1);

  const [favourites, setFavourites] = useState<any[]>([]);

  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addingMoney, setAddingMoney] = useState(false);
  const [addError, setAddError] = useState('');

  const [cancellingId, setCancellingId] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  useEffect(() => {
    walletService.getWallet().then(r => setWalletBalance(r.data?.walletBalance ?? 0)).catch(() => {});
    walletService.getTransactions(txPage).then(r => {
      setTransactions(r.data?.transactions ?? []);
      setTxPages(r.data?.pages ?? 1);
    }).catch(() => {});
    bookingService.getMyBookings(bkPage).then(r => {
      setBookings(r.data?.bookings ?? []);
      setBkPages(r.data?.pages ?? 1);
    }).catch(() => {});
    playerService.getFavourites().then(r => setFavourites(r.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    walletService.getTransactions(txPage).then(r => {
      setTransactions(r.data?.transactions ?? []);
      setTxPages(r.data?.pages ?? 1);
    }).catch(() => {});
  }, [txPage]);

  useEffect(() => {
    bookingService.getMyBookings(bkPage).then(r => {
      setBookings(r.data?.bookings ?? []);
      setBkPages(r.data?.pages ?? 1);
    }).catch(() => {});
  }, [bkPage]);

  const refreshWallet = useCallback(async () => {
    const wr = await walletService.getWallet();
    setWalletBalance(wr.data?.walletBalance ?? 0);
    const tr = await walletService.getTransactions(1);
    setTransactions(tr.data?.transactions ?? []);
    setTxPages(tr.data?.pages ?? 1);
    setTxPage(1);
  }, []);

  const handleAddMoney = async () => {
    const amount = Number(addMoneyAmount);
    if (!amount || amount < 10) { setAddError('Minimum amount is ₹10'); return; }
    setAddingMoney(true);
    setAddError('');
    try {
      // Step 1: Create order on backend
      const res = await walletService.initiateRecharge(amount);
      const { paymentSessionId, orderId } = res.data;

      // Step 2: Load Cashfree SDK and open payment UI
      const cashfreeMode = import.meta.env.VITE_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
      const cashfree = await load({ mode: cashfreeMode });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',  // opens inline modal — no page redirect
      }).then(async (result: any) => {
        if (result.error) {
          setAddError(result.error.message || 'Payment failed');
          setAddingMoney(false);
          return;
        }

        // Step 3: Verify payment and credit wallet
        try {
          const vRes = await walletService.verifyRecharge(orderId);
          if (vRes.data?.success) {
            await refreshWallet();
            setShowAddMoney(false);
            setAddMoneyAmount('');
          } else {
            setAddError('Payment verification failed. Contact support with order ID: ' + orderId);
          }
        } catch {
          setAddError('Payment done but wallet update failed. Please refresh the page.');
        } finally {
          setAddingMoney(false);
        }
      });

    } catch (err: any) {
      setAddError(err.response?.data?.message || 'Failed to initiate payment');
      setAddingMoney(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    setCancellingId(id);
    setCancelError('');
    try {
      const res = await bookingService.cancelBooking(id);
      // Refresh bookings
      const r = await bookingService.getMyBookings(bkPage);
      setBookings(r.data?.bookings ?? []);
      // Refresh wallet balance + transactions to show refund
      await refreshWallet();
      const refund = res.data?.refundAmount ?? 0;
      setCancelSuccessMsg(
        refund > 0
          ? `Booking cancelled. ₹${refund} refunded to your wallet.`
          : 'Booking cancelled. No refund as per arena policy.',
      );
      setTimeout(() => setCancelSuccessMsg(''), 5000);
    } catch (err: any) {
      setCancelError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId('');
    }
  };

  const handleLeaveArena = async (arenaId: string) => {
    await playerService.leaveArena(arenaId);
    setFavourites(f => f.filter((fav: any) => fav.arenaId !== arenaId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {player?.name?.split(' ')[0] || 'Player'}!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-green-600">₹{walletBalance}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {showAddMoney ? (
                <div className="space-y-2">
                  <input type="number" min={10} value={addMoneyAmount}
                    onChange={e => { setAddMoneyAmount(e.target.value); setAddError(''); }}
                    placeholder="Amount (₹)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  {addError && <p className="text-xs text-red-500">{addError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAddMoney} disabled={addingMoney}>
                      {addingMoney ? 'Processing...' : 'Proceed'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setShowAddMoney(false); setAddMoneyAmount(''); setAddError(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddMoney(true)}>
                  <Plus className="h-4 w-4 mr-2" />Add Money
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Arenas</p>
                  <p className="text-3xl font-bold text-purple-600">{favourites.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-6">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="arenas">My Arenas</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {cancelSuccessMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{cancelSuccessMsg}</div>}
            {cancelError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{cancelError}</div>}
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card><CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No bookings yet</p>
                  <Button onClick={() => navigate('/arenas')} className="bg-green-600 hover:bg-green-700">Browse Arenas</Button>
                </CardContent></Card>
              ) : bookings.map(b => (
                <Card key={b.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{b.arena?.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                          <MapPin className="h-3.5 w-3.5" />{b.arena?.city}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{b.court?.gameType?.name} — {b.court?.name}</p>
                        <p className="text-sm font-medium mt-1">
                          {b.slot?.date ? new Date(b.slot.date).toLocaleDateString('en-IN') : ''} &nbsp;·&nbsp;
                          {b.slot?.startTime} – {b.slot?.endTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={b.status === 'CONFIRMED' ? 'default' : b.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                          {b.status}
                        </Badge>
                        <p className="font-bold text-green-600 mt-2">₹{b.price}</p>
                        {b.status === 'CONFIRMED' && (
                          <Button variant="outline" size="sm" className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelBooking(b.id)} disabled={cancellingId === b.id}>
                            {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {bkPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="outline" size="sm" onClick={() => setBkPage(p => p - 1)} disabled={bkPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm text-gray-600">Page {bkPage} of {bkPages}</span>
                <Button variant="outline" size="sm" onClick={() => setBkPage(p => p + 1)} disabled={bkPage === bkPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wallet">
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <Card><CardContent className="p-8 text-center"><p className="text-gray-500">No transactions yet</p></CardContent></Card>
              ) : transactions.map(t => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{t.reason || t.source}</p>
                      <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`font-bold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            {txPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="outline" size="sm" onClick={() => setTxPage(p => p - 1)} disabled={txPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm text-gray-600">Page {txPage} of {txPages}</span>
                <Button variant="outline" size="sm" onClick={() => setTxPage(p => p + 1)} disabled={txPage === txPages}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="arenas">
            {favourites.length === 0 ? (
              <Card><CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No favourite arenas yet</p>
                <Button onClick={() => navigate('/arenas')} className="bg-green-600 hover:bg-green-700">Browse Arenas</Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favourites.map((fav: any) => (
                  <Card key={fav.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/arena/${fav.arenaId}`} className="font-semibold text-gray-900 hover:text-green-600">{fav.arena?.name}</Link>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin className="h-3.5 w-3.5" />{fav.arena?.city}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {fav.arena?.gameTypes?.slice(0, 2).map((g: any) => (
                              <Badge key={g.name} variant="secondary" className="text-xs">{g.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleLeaveArena(fav.arenaId)} className="text-red-400 hover:text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <ProfileCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
