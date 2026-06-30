import { useState, useEffect, useCallback } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { useNavigate } from 'react-router-dom';
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
      const res = await walletService.initiateRecharge(amount);
      const { paymentSessionId, orderId } = res.data;
      const cashfreeMode = import.meta.env.VITE_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox';
      const cashfree = await load({ mode: cashfreeMode });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
      }).then(async (result: any) => {
        if (result.error) {
          setAddError(result.error.message || 'Payment failed');
          setAddingMoney(false);
          return;
        }

        try {
          const vRes = await walletService.verifyRecharge(orderId);
          if (vRes.data?.success) {
            await refreshWallet();
            setShowAddMoney(false);
            setAddMoneyAmount('');
          } else {
            setAddError('Payment verification failed. Contact order ID: ' + orderId);
          }
        } catch {
          setAddError('Payment done but wallet update failed. Please refresh.');
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
      const r = await bookingService.getMyBookings(bkPage);
      setBookings(r.data?.bookings ?? []);
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
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      
      {/* Background Accent Glows */}
      <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow relative z-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">My Dashboard</h1>
        <p className="text-slate-500 text-sm mb-10 font-medium">Welcome back, {player?.name?.split(' ')[0] || 'Player'}!</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-slate-100 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Wallet Balance</p>
                  <p className="text-3xl font-black text-emerald-600">₹{walletBalance}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              {showAddMoney ? (
                <div className="space-y-2">
                  <input type="number" min={10} value={addMoneyAmount}
                    onChange={e => { setAddMoneyAmount(e.target.value); setAddError(''); }}
                    placeholder="Amount (₹)"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                  {addError && <p className="text-xs text-red-500">{addError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer" onClick={handleAddMoney} disabled={addingMoney}>
                      {addingMoney ? 'Processing...' : 'Proceed'}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-slate-200 text-slate-600 cursor-pointer" onClick={() => { setShowAddMoney(false); setAddMoneyAmount(''); setAddError(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => setShowAddMoney(true)}>
                  <Plus className="h-4 w-4 mr-2 text-emerald-600" />Add Money
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Bookings</p>
                  <p className="text-3xl font-black text-blue-600">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">My Arenas</p>
                  <p className="text-3xl font-black text-purple-600">{favourites.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="mb-8 border border-slate-200 bg-slate-100/80 p-1 rounded-xl">
            <TabsTrigger value="bookings" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">My Bookings</TabsTrigger>
            <TabsTrigger value="wallet" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Wallet</TabsTrigger>
            <TabsTrigger value="arenas" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">My Arenas</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            {cancelSuccessMsg && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{cancelSuccessMsg}</div>}
            {cancelError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{cancelError}</div>}
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <Card className="border-slate-100 bg-white shadow-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-500 mb-4 font-medium">No bookings yet</p>
                    <Button onClick={() => navigate('/arenas')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/10 cursor-pointer">Browse Arenas</Button>
                  </CardContent>
                </Card>
              ) : bookings.map(b => (
                <Card key={b.id} className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{b.arena?.name}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-500" />{b.arena?.city}
                        </div>
                        <p className="text-slate-600 text-xs mt-1 font-medium">{b.court?.gameType?.name} &middot; {b.court?.name}</p>
                        <p className="text-slate-700 text-sm font-semibold mt-2">
                          {b.slot?.date ? new Date(b.slot.date).toLocaleDateString('en-IN') : ''} &middot; {b.slot?.startTime} – {b.slot?.endTime}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <Badge variant={b.status === 'CONFIRMED' ? 'default' : b.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="font-bold rounded-full">
                          {b.status}
                        </Badge>
                        <p className="font-extrabold text-emerald-600 text-lg sm:mt-2">₹{b.price}</p>
                        {b.status === 'CONFIRMED' && (
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-semibold cursor-pointer"
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
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="outline" size="sm" onClick={() => setBkPage(p => p - 1)} disabled={bkPage === 1} className="border-slate-200 text-slate-600"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm text-slate-500 font-medium">Page {bkPage} of {bkPages}</span>
                <Button variant="outline" size="sm" onClick={() => setBkPage(p => p + 1)} disabled={bkPage === bkPages} className="border-slate-200 text-slate-600"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wallet">
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <Card className="border-slate-100 bg-white shadow-sm"><CardContent className="p-8 text-center"><p className="text-slate-500 font-medium">No transactions yet</p></CardContent></Card>
              ) : transactions.map(t => (
                <Card key={t.id} className="border-slate-100 bg-white shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{t.reason || t.source}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`font-extrabold text-base ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            {txPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button variant="outline" size="sm" onClick={() => setTxPage(p => p - 1)} disabled={txPage === 1} className="border-slate-200 text-slate-600"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-sm text-slate-500 font-medium">Page {txPage} of {txPages}</span>
                <Button variant="outline" size="sm" onClick={() => setTxPage(p => p + 1)} disabled={txPage === txPages} className="border-slate-200 text-slate-600"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="arenas">
            {favourites.length === 0 ? (
              <Card className="border-slate-100 bg-white shadow-sm"><CardContent className="p-8 text-center">
                <p className="text-slate-500 mb-4 font-medium">No favourite arenas yet</p>
                <Button onClick={() => navigate('/arenas')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/10 cursor-pointer">Browse Arenas</Button>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favourites.map((fav: any) => (
                  <Card key={fav.id} className="border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link to={`/arena/${fav.arenaId}`} className="font-bold text-slate-800 hover:text-emerald-600 transition-colors">{fav.arena?.name}</Link>
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />{fav.arena?.city}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {fav.arena?.gameTypes?.slice(0, 2).map((g: any) => (
                              <Badge key={g.name} variant="secondary" className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100">{g.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleLeaveArena(fav.arenaId)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="max-w-xl">
            <ProfileCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
