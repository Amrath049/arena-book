import { useState, useEffect, useCallback } from 'react';
import { load } from '@cashfreepayments/cashfree-js';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Wallet, Heart, MapPin, Plus, X, ChevronLeft, ChevronRight, User, Menu } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ProfileCard } from '@/app/components/ProfileCard';
import { walletService } from '@/services/wallet.service';
import { bookingService } from '@/services/booking.service';
import { playerService } from '@/services/player.service';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { player } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'wallet' | 'arenas'>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Counts for Stats Cards (cached/loaded on mount)
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  const [totalArenasCount, setTotalArenasCount] = useState(0);

  // Tab-specific details (loaded only when switched to specific tabs)
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txPages, setTxPages] = useState(1);
  const [txPage, setTxPage] = useState(1);

  const [bookings, setBookings] = useState<any[]>([]);
  const [bkPages, setBkPages] = useState(1);
  const [bkPage, setBkPage] = useState(1);

  const [favourites, setFavourites] = useState<any[]>([]);

  // Add money states
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addingMoney, setAddingMoney] = useState(false);
  const [addError, setAddError] = useState('');

  // Cancel states
  const [cancellingId, setCancellingId] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Greetings and Quotes Constants
  const [greetingPrefix, setGreetingPrefix] = useState('Welcome back');
  const [playerName, setPlayerName] = useState('Player');
  const [greetingSuffix, setGreetingSuffix] = useState("let's play");
  const [quote, setQuote] = useState('');

  // 1. Initial Load: Fetch stats and counts from player profile response
  useEffect(() => {
    playerService.getProfile().then(r => {
      const p = r.data;
      setWalletBalance(p.walletBalance ?? 0);
      setTotalBookingsCount(p._count?.bookings ?? 0);
      setTotalArenasCount(p._count?.favourites ?? 0);

      // Set time-based greeting using actual player name from database profile response
      const hr = new Date().getHours();
      const name = p.name?.split(' ')[0] || player?.name?.split(' ')[0] || 'Player';
      setPlayerName(name);

      if (hr >= 5 && hr < 12) {
        setGreetingPrefix('Good morning');
        setGreetingSuffix("let's play");
      } else if (hr >= 12 && hr < 17) {
        setGreetingPrefix('Good afternoon');
        setGreetingSuffix('ready for a game?');
      } else {
        setGreetingPrefix('Good evening');
        setGreetingSuffix('time to dominate the field');
      }
    }).catch(() => {});

    const quotes = [
      "Champions keep playing until they get it right. – Billie Jean King",
      "Hard work beats talent when talent doesn't work hard. – Tim Notke",
      "The harder the victory, the greater the happiness in winning. – Pelé",
      "Make each day your masterpiece. – John Wooden",
      "Dominate the day, control your game.",
      "Gold medals aren't really made of gold. They're made of sweat, determination, and hard-to-find guts. – Dan Gable",
      "It's not about being the best. It's about being better than you were yesterday."
    ];
    const quoteIndex = new Date().getDate() % quotes.length;
    setQuote(quotes[quoteIndex]);
  }, [player]);

  // 2. Fetch bookings only when activeTab is 'bookings' or bkPage changes
  useEffect(() => {
    if (activeTab !== 'bookings') return;
    bookingService.getMyBookings(bkPage).then(r => {
      setBookings(r.data?.bookings ?? []);
      setBkPages(r.data?.pages ?? 1);
      setTotalBookingsCount(r.data?.total ?? 0);
    }).catch(() => {});
  }, [activeTab, bkPage]);

  // 3. Fetch transactions only when activeTab is 'wallet' or txPage changes
  useEffect(() => {
    if (activeTab !== 'wallet') return;
    walletService.getTransactions(txPage).then(r => {
      setTransactions(r.data?.transactions ?? []);
      setTxPages(r.data?.pages ?? 1);
    }).catch(() => {});
  }, [activeTab, txPage]);

  // 4. Fetch favourites list only when activeTab is 'arenas'
  useEffect(() => {
    if (activeTab !== 'arenas') return;
    playerService.getFavourites().then(r => {
      const list = r.data ?? [];
      setFavourites(list);
      setTotalArenasCount(list.length);
    }).catch(() => {});
  }, [activeTab]);

  const refreshWallet = useCallback(async () => {
    const wr = await walletService.getWallet();
    setWalletBalance(wr.data?.walletBalance ?? 0);
    if (activeTab === 'wallet') {
      const tr = await walletService.getTransactions(1);
      setTransactions(tr.data?.transactions ?? []);
      setTxPages(tr.data?.pages ?? 1);
      setTxPage(1);
    }
  }, [activeTab]);

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
      
      // Refresh current page of bookings
      const r = await bookingService.getMyBookings(bkPage);
      setBookings(r.data?.bookings ?? []);
      setTotalBookingsCount(r.data?.total ?? 0);
      
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
    setTotalArenasCount(c => Math.max(0, c - 1));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      
      {/* Background Accent Glows */}
      <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow relative z-10">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* ── Left Sidebar Navigation (Desktop) ── */}
          <aside className="hidden md:block w-64 shrink-0 space-y-1">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Account Portal</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage bookings & funds</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left whitespace-nowrap
                  ${activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'bg-white hover:bg-slate-100/50 text-slate-600 border border-slate-100/60 shadow-sm'
                  }`}
              >
                <User className="h-4.5 w-4.5 shrink-0" />
                <span>Overview & Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left whitespace-nowrap
                  ${activeTab === 'bookings'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'bg-white hover:bg-slate-100/50 text-slate-600 border border-slate-100/60 shadow-sm'
                  }`}
              >
                <Calendar className="h-4.5 w-4.5 shrink-0" />
                <span>My Bookings</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left whitespace-nowrap
                  ${activeTab === 'wallet'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'bg-white hover:bg-slate-100/50 text-slate-600 border border-slate-100/60 shadow-sm'
                  }`}
              >
                <Wallet className="h-4.5 w-4.5 shrink-0" />
                <span>Wallet & Transactions</span>
              </button>

              <button
                onClick={() => setActiveTab('arenas')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left whitespace-nowrap
                  ${activeTab === 'arenas'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'bg-white hover:bg-slate-100/50 text-slate-600 border border-slate-100/60 shadow-sm'
                  }`}
              >
                <Heart className="h-4.5 w-4.5 shrink-0" />
                <span>My Arenas</span>
              </button>
            </div>
          </aside>

          {/* ── Mobile Navigation Trigger Bar ── */}
          <div className="flex md:hidden items-center justify-between bg-white border border-slate-150 p-3 rounded-2xl shadow-sm w-full mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                {activeTab === 'dashboard' && <User className="h-5 w-5 text-emerald-600" />}
                {activeTab === 'bookings' && <Calendar className="h-5 w-5 text-emerald-600" />}
                {activeTab === 'wallet' && <Wallet className="h-5 w-5 text-emerald-600" />}
                {activeTab === 'arenas' && <Heart className="h-5 w-5 text-emerald-600" />}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active View</span>
                <p className="text-sm font-extrabold text-slate-700">
                  {activeTab === 'dashboard' ? 'Overview & Profile' : activeTab === 'bookings' ? 'My Bookings' : activeTab === 'wallet' ? 'Wallet & Transactions' : 'My Arenas'}
                </p>
              </div>
            </div>
            <Button onClick={() => setIsMobileOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm rounded-xl cursor-pointer py-2.5 px-4 text-xs">
              <Menu className="h-4 w-4" />
              <span>Menu</span>
            </Button>
          </div>

          {/* ── Mobile Sidebar Drawer Overlay ── */}
          {isMobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMobileOpen(false)}
              />
              
              {/* Drawer Panel */}
              <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-50 transform transition-transform duration-300 ease-out translate-x-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 tracking-tight">Account Portal</h2>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">Navigation Menu</p>
                    </div>
                    <button 
                      onClick={() => setIsMobileOpen(false)} 
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => { setActiveTab('dashboard'); setIsMobileOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left
                        ${activeTab === 'dashboard'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100/40 shadow-sm'
                        }`}
                    >
                      <User className="h-4.5 w-4.5 shrink-0" />
                      <span>Overview & Profile</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('bookings'); setIsMobileOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left
                        ${activeTab === 'bookings'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100/40 shadow-sm'
                        }`}
                    >
                      <Calendar className="h-4.5 w-4.5 shrink-0" />
                      <span>My Bookings</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('wallet'); setIsMobileOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left
                        ${activeTab === 'wallet'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100/40 shadow-sm'
                        }`}
                    >
                      <Wallet className="h-4.5 w-4.5 shrink-0" />
                      <span>Wallet & Transactions</span>
                    </button>

                    <button
                      onClick={() => { setActiveTab('arenas'); setIsMobileOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer w-full text-left
                        ${activeTab === 'arenas'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100/40 shadow-sm'
                        }`}
                    >
                      <Heart className="h-4.5 w-4.5 shrink-0" />
                      <span>My Arenas</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ArenaBook App</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Right Content Area ── */}
          <main className="flex-1 w-full space-y-8">
            
            {/* Greetings section */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl tracking-tight leading-tight text-slate-700 font-medium">
                {greetingPrefix}, <span className="font-extrabold text-slate-900 capitalize">{playerName}</span>! {greetingSuffix}.
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium italic">&ldquo;{quote}&rdquo;</p>
            </div>

            {/* 1. OVERVIEW & PROFILE TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Stats cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                          <p className="text-3xl font-black text-blue-600">{totalBookingsCount}</p>
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
                          <p className="text-3xl font-black text-purple-600">{totalArenasCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Details */}
                <div className="max-w-4xl">
                  <ProfileCard />
                </div>
              </div>
            )}

            {/* 2. MY BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-4 animate-fadeIn">
                {cancelSuccessMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-semibold">{cancelSuccessMsg}</div>}
                {cancelError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">{cancelError}</div>}
                
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
                          <h3 className="font-bold text-slate-800 text-base">
                            <Link to={`/arena/${b.arenaId}`} className="hover:text-emerald-600 transition-colors">
                              {b.arena?.name}
                            </Link>
                          </h3>
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
                {bkPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button variant="outline" size="sm" onClick={() => setBkPage(p => p - 1)} disabled={bkPage === 1} className="border-slate-200 text-slate-600"><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm text-slate-500 font-medium">Page {bkPage} of {bkPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setBkPage(p => p + 1)} disabled={bkPage === bkPages} className="border-slate-200 text-slate-600"><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            )}

            {/* 3. WALLET & TRANSACTIONS TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-6 animate-fadeIn">
                <Card className="border-slate-100 bg-white shadow-sm max-w-md">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Available Funds</p>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-black text-emerald-600">₹{walletBalance}</p>
                      <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    {showAddMoney ? (
                      <div className="space-y-2 mt-4">
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
                      <Button variant="outline" size="sm" className="w-full mt-4 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => setShowAddMoney(true)}>
                        <Plus className="h-4 w-4 mr-2 text-emerald-600" />Add Money
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">Transaction History</h3>
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
              </div>
            )}

            {/* 4. MY ARENAS TAB */}
            {activeTab === 'arenas' && (
              <div className="space-y-4 animate-fadeIn">
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
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
