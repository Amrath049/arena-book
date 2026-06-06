import { useState, useEffect, useCallback } from 'react';
import { X, Plus, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookingsService } from '@/services/bookings.service';
import { arenaService } from '@/services/arena.service';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function Bookings() {
  const navigate = useNavigate();
  const [arenaId, setArenaId] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [completingId, setCompletingId] = useState('');
  const [message, setMessage] = useState('');

  const fetchBookings = useCallback((aid: string, p = 1, status = '') => {
    if (!aid) return;
    setLoading(true);
    bookingsService.getArenaBookings(aid, p, 20, status || undefined).then(r => {
      const d = r.data;
      setBookings(d.bookings ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    arenaService.getMyArena().then(r => {
      const id = r.data?.data?.id || r.data?.id;
      if (id) {
        setArenaId(id);
        fetchBookings(id, 1, filterStatus);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (arenaId) fetchBookings(arenaId, page, filterStatus);
  }, [page, filterStatus, arenaId]);

  const handleCancel = async () => {
    if (!selectedId) return;
    setCancelling(true);
    try {
      await bookingsService.cancelBooking(selectedId, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setMessage('Booking cancelled');
      fetchBookings(arenaId, page, filterStatus);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedId) return;
    setCompletingId(selectedId);
    try {
      const res = await bookingsService.completeBooking(selectedId);
      setShowCompleteModal(false);
      setSelectedBooking(null);
      setMessage(`Booking completed — ₹${res.data.amount} credited to your wallet`);
      fetchBookings(arenaId, page, filterStatus);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to complete booking');
      setShowCompleteModal(false);
    } finally {
      setCompletingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Bookings</h2>
          <p className="text-neutral-600 mt-1">{total} total bookings</p>
        </div>
        <button
          onClick={() => navigate('/admin-book-slot')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> New Booking
        </button>
      </div>

      {message && <div className={`p-3 rounded-lg text-sm ${message.includes('cancelled') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{message}</div>}

      <div className="flex gap-2 flex-wrap">
        {['', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                {['Booking ID', 'Player', 'Date', 'Time', 'Court', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-neutral-500">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-neutral-500">No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 text-xs text-neutral-500 font-mono">{b.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">{b.player?.name || '—'}</div>
                    <div className="text-xs text-neutral-500">{b.player?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">
                    {b.slot?.date ? new Date(b.slot.date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 whitespace-nowrap">{b.slot?.startTime} – {b.slot?.endTime}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{b.court?.gameType?.name} – {b.court?.name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900">₹{b.price}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-neutral-100 text-neutral-700'}`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === 'CONFIRMED' && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setSelectedId(b.id); setSelectedBooking(b); setShowCompleteModal(true); }}
                          disabled={completingId === b.id}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {completingId === b.id ? 'Processing...' : 'Complete'}
                        </button>
                        <button onClick={() => { setSelectedId(b.id); setShowCancelModal(true); }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium">Cancel</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-40"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-40"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cancel Booking</h3>
              <button onClick={() => setShowCancelModal(false)}><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Keep Booking</button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60">
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Complete Booking</h3>
              </div>
              <button onClick={() => { setShowCompleteModal(false); setSelectedBooking(null); }}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Player</span>
                <span className="font-medium">{selectedBooking.player?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date</span>
                <span className="font-medium">
                  {selectedBooking.slot?.date ? new Date(selectedBooking.slot.date).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time</span>
                <span className="font-medium">{selectedBooking.slot?.startTime} – {selectedBooking.slot?.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Court</span>
                <span className="font-medium">{selectedBooking.court?.gameType?.name} – {selectedBooking.court?.name}</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between font-semibold">
                <span>Amount to be credited</span>
                <span className="text-green-600">₹{selectedBooking.price}</span>
              </div>
            </div>

            <p className="text-sm text-neutral-500 mb-5">
              This will mark the booking as <strong>Completed</strong> and credit <strong>₹{selectedBooking.price}</strong> to your wallet.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCompleteModal(false); setSelectedBooking(null); }}
                className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
              >
                Go Back
              </button>
              <button
                onClick={handleComplete}
                disabled={completingId === selectedId}
                className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {completingId === selectedId ? 'Processing...' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
