import { useState } from 'react';
import { Search, Filter, X, Calendar, User, Phone, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: number;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  court: string;
  game: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

const mockBookings: Booking[] = [
  { id: 1, bookingId: 'BK001', customerName: 'Rahul Sharma', customerPhone: '+91 98765 43210', date: '2026-01-20', time: '06:00 AM - 07:00 AM', court: 'Badminton Court 1', game: 'Badminton', amount: 500, status: 'confirmed' },
  { id: 2, bookingId: 'BK002', customerName: 'Priya Patel', customerPhone: '+91 98765 43211', date: '2026-01-20', time: '07:00 AM - 08:00 AM', court: 'Cricket Net 1', game: 'Cricket', amount: 800, status: 'confirmed' },
  { id: 3, bookingId: 'BK003', customerName: 'Amit Kumar', customerPhone: '+91 98765 43212', date: '2026-01-20', time: '08:00 AM - 09:00 AM', court: 'Badminton Court 2', game: 'Badminton', amount: 500, status: 'pending' },
  { id: 4, bookingId: 'BK004', customerName: 'Sneha Reddy', customerPhone: '+91 98765 43213', date: '2026-01-21', time: '06:00 AM - 07:00 AM', court: 'Cricket Net 2', game: 'Cricket', amount: 800, status: 'confirmed' },
  { id: 5, bookingId: 'BK005', customerName: 'Vikram Singh', customerPhone: '+91 98765 43214', date: '2026-01-19', time: '18:00 PM - 19:00 PM', court: 'Badminton Court 1', game: 'Badminton', amount: 600, status: 'completed' },
  { id: 6, bookingId: 'BK006', customerName: 'Anjali Mehta', customerPhone: '+91 98765 43215', date: '2026-01-18', time: '19:00 PM - 20:00 PM', court: 'Football Field 1', game: 'Football', amount: 1200, status: 'cancelled' },
];

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCancelBooking = () => {
    if (selectedBooking && cancelReason) {
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'cancelled' as const } : b
      ));
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Bookings</h2>
          <p className="text-neutral-600 mt-1">View and manage all bookings</p>
        </div>
        <button
          onClick={() => navigate('/admin-book-slot')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Book Slot
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by customer name or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: bookings.length, color: 'from-blue-50 to-blue-100 border-blue-200' },
          { label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length, color: 'from-green-50 to-green-100 border-green-200' },
          { label: 'Pending', count: bookings.filter(b => b.status === 'pending').length, color: 'from-yellow-50 to-yellow-100 border-yellow-200' },
          { label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length, color: 'from-red-50 to-red-100 border-red-200' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 border`}>
            <p className="text-sm text-neutral-600">{stat.label}</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-1">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-medium text-neutral-900">
                      {booking.bookingId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm font-medium text-neutral-900">
                        <User className="w-4 h-4 mr-2 text-neutral-400" />
                        {booking.customerName}
                      </div>
                      <div className="flex items-center text-xs text-neutral-600 mt-1">
                        <Phone className="w-3 h-3 mr-2" />
                        {booking.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center text-sm text-neutral-900">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                        {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">
                        {booking.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{booking.court}</p>
                      <p className="text-xs text-neutral-600">{booking.game}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    ₹{booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="px-3 py-1.5 text-xs rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-900">Cancel Booking</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                }}
                className="p-1 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-neutral-600">Booking ID</p>
              <p className="font-mono font-medium text-neutral-900">{selectedBooking.bookingId}</p>
              <p className="text-sm text-neutral-600 mt-2">Customer</p>
              <p className="font-medium text-neutral-900">{selectedBooking.customerName}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for cancellation..."
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancelReason.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}