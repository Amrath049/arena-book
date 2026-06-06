import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Phone, Check } from 'lucide-react';
import { playersService } from '@/services/players.service';
import { gamesService } from '@/services/games.service';
import { slotsService } from '@/services/slots.service';
import { bookingsService } from '@/services/bookings.service';
import { arenaService } from '@/services/arena.service';

type Step = 'player' | 'slot' | 'confirmation';

export function AdminBookSlot() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('player');
  const [arenaId, setArenaId] = useState('');

  // Player search
  const [playerSearch, setPlayerSearch] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [searchingPlayers, setSearchingPlayers] = useState(false);

  // Slot selection
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    arenaService.getMyArena().then(r => {
      const id = r.data?.data?.id || r.data?.id;
      if (id) {
        setArenaId(id);
        return gamesService.getGamesByArena(id);
      }
    }).then(r => {
      if (r) setGames(r.data?.games ?? []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGame) { setCourts([]); setSelectedCourt(''); return; }
    gamesService.getCourtsByGame(selectedGame).then(r => {
      const c = r.data?.courts ?? [];
      setCourts(c);
    }).catch(console.error);
  }, [selectedGame]);

  useEffect(() => {
    if (!selectedCourt || !selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    slotsService.getAvailableSlots(selectedCourt, selectedDate).then(r => {
      setSlots(r.data ?? []);
    }).catch(console.error).finally(() => setLoadingSlots(false));
  }, [selectedCourt, selectedDate]);

  const searchPlayers = () => {
    if (!playerSearch) return;
    setSearchingPlayers(true);
    playersService.getPlayers(playerSearch, 1, 10).then(r => setPlayers(r.data?.players ?? [])).catch(console.error).finally(() => setSearchingPlayers(false));
  };

  const confirmBooking = async () => {
    if (!selectedPlayer || !selectedSlot || !selectedCourt || !selectedDate || !arenaId) return;
    setBooking(true);
    setBookingError('');
    try {
      await bookingsService.adminCreateBooking({
        playerId: selectedPlayer.id,
        courtId: selectedCourt,
        arenaId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        price: selectedSlot.price,
      });
      navigate('/bookings');
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Failed to create booking');
      setBooking(false);
    }
  };

  const steps = [
    { key: 'player', label: 'Select Player', done: !!selectedPlayer },
    { key: 'slot', label: 'Book Slot', done: !!selectedSlot },
    { key: 'confirmation', label: 'Confirm', done: false },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Book a Slot</h2>
        <p className="text-neutral-600 mt-1">Create a booking on behalf of a player</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step === s.key ? 'bg-blue-600 text-white' : s.done ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-600'}`}>
              {s.done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === s.key ? 'text-blue-600' : 'text-neutral-500'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-neutral-300 ml-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Player Selection */}
      {step === 'player' && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-4">
          <h3 className="font-semibold text-neutral-900">Search Player</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={playerSearch}
                onChange={e => setPlayerSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchPlayers()}
                placeholder="Search by name, phone or email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <button onClick={searchPlayers} disabled={searchingPlayers}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {searchingPlayers ? 'Searching...' : 'Search'}
            </button>
          </div>

          {players.length > 0 && (
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id}
                  onClick={() => setSelectedPlayer(p)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${selectedPlayer?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:border-blue-300 hover:bg-neutral-50'}`}>
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{p.name}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{p.phone}</span>
                      <span>Wallet: ₹{p.walletBalance}</span>
                    </div>
                  </div>
                  {selectedPlayer?.id === p.id && <Check className="w-5 h-5 text-blue-600 ml-auto" />}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setStep('slot')} disabled={!selectedPlayer}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Slot Selection */}
      {step === 'slot' && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Select Slot</h3>
            <div className="text-sm text-neutral-600">Player: <span className="font-medium">{selectedPlayer?.name}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Sport</label>
              <select value={selectedGame} onChange={e => { setSelectedGame(e.target.value); setSelectedCourt(''); setSelectedSlot(null); }}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select sport...</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Court</label>
              <select value={selectedCourt} onChange={e => { setSelectedCourt(e.target.value); setSelectedSlot(null); }}
                disabled={!selectedGame}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
                <option value="">Select court...</option>
                {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Date</label>
            <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {selectedCourt && selectedDate && (
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-2">Available Slots</p>
              {loadingSlots ? (
                <p className="text-sm text-neutral-500">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-neutral-500">No slots defined for this day. Configure slots in Slots & Pricing.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot, i) => (
                    <button key={i} onClick={() => slot.status === 'AVAILABLE' && setSelectedSlot(slot)}
                      disabled={slot.status !== 'AVAILABLE'}
                      className={`p-2.5 rounded-lg text-sm font-medium border transition-colors
                        ${selectedSlot?.startTime === slot.startTime ? 'bg-blue-600 text-white border-blue-600' :
                          slot.status === 'AVAILABLE' ? 'bg-white border-neutral-300 hover:border-blue-400 hover:bg-blue-50' :
                          'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'}`}>
                      <div>{slot.startTime}</div>
                      <div className="text-xs">₹{slot.price}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('player')} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Back</button>
            <button onClick={() => setStep('confirmation')} disabled={!selectedSlot}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-white rounded-xl p-6 border border-neutral-200 space-y-4">
          <h3 className="font-semibold text-neutral-900">Confirm Booking</h3>

          {bookingError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{bookingError}</div>}

          <div className="bg-neutral-50 rounded-lg p-4 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-neutral-600">Player</span><span className="font-medium">{selectedPlayer?.name}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Date</span><span className="font-medium">{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Time</span><span className="font-medium">{selectedSlot?.startTime} – {selectedSlot?.endTime}</span></div>
            <div className="flex justify-between"><span className="text-neutral-600">Court</span><span className="font-medium">{courts.find(c => c.id === selectedCourt)?.name}</span></div>
            <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold">
              <span>Total Amount</span><span className="text-blue-600">₹{selectedSlot?.price}</span>
            </div>
          </div>

          <p className="text-xs text-neutral-500">Amount will be deducted from the player's wallet (current balance: ₹{selectedPlayer?.walletBalance})</p>

          <div className="flex gap-3">
            <button onClick={() => setStep('slot')} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Back</button>
            <button onClick={confirmBooking} disabled={booking}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-60">
              {booking ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
