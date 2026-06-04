import { useState } from 'react';
import { Search, Filter, User, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  totalBookings: number;
  joinedDate: string;
}

const mockPlayers: Player[] = [
  { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@example.com', status: 'active', totalBookings: 24, joinedDate: '2025-11-15' },
  { id: 2, name: 'Priya Patel', phone: '+91 98765 43211', email: 'priya@example.com', status: 'active', totalBookings: 18, joinedDate: '2025-12-03' },
  { id: 3, name: 'Amit Kumar', phone: '+91 98765 43212', email: 'amit@example.com', status: 'active', totalBookings: 32, joinedDate: '2025-10-22' },
  { id: 4, name: 'Sneha Reddy', phone: '+91 98765 43213', email: 'sneha@example.com', status: 'active', totalBookings: 15, joinedDate: '2025-12-18' },
  { id: 5, name: 'Vikram Singh', phone: '+91 98765 43214', email: 'vikram@example.com', status: 'inactive', totalBookings: 8, joinedDate: '2025-09-10' },
  { id: 6, name: 'Anjali Mehta', phone: '+91 98765 43215', email: 'anjali@example.com', status: 'active', totalBookings: 21, joinedDate: '2025-11-28' },
  { id: 7, name: 'Rohan Gupta', phone: '+91 98765 43216', email: 'rohan@example.com', status: 'active', totalBookings: 12, joinedDate: '2026-01-05' },
  { id: 8, name: 'Kavya Nair', phone: '+91 98765 43217', email: 'kavya@example.com', status: 'active', totalBookings: 27, joinedDate: '2025-11-02' },
  { id: 9, name: 'Arjun Desai', phone: '+91 98765 43218', email: 'arjun@example.com', status: 'active', totalBookings: 19, joinedDate: '2025-12-14' },
  { id: 10, name: 'Ishita Joshi', phone: '+91 98765 43219', email: 'ishita@example.com', status: 'inactive', totalBookings: 6, joinedDate: '2025-08-25' },
  { id: 11, name: 'Karthik Rao', phone: '+91 98765 43220', email: 'karthik@example.com', status: 'active', totalBookings: 14, joinedDate: '2025-12-30' },
  { id: 12, name: 'Meera Shah', phone: '+91 98765 43221', email: 'meera@example.com', status: 'active', totalBookings: 22, joinedDate: '2025-10-18' },
];

const ITEMS_PER_PAGE = 10;

export function Players() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPlayers = mockPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          player.phone.includes(searchTerm) ||
                          player.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || player.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlayers = filteredPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-neutral-200 text-neutral-600';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Players</h2>
        <p className="text-neutral-600 mt-1">View and manage registered players</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Players', count: mockPlayers.length, color: 'from-blue-50 to-blue-100 border-blue-200' },
          { label: 'Active', count: mockPlayers.filter(p => p.status === 'active').length, color: 'from-green-50 to-green-100 border-green-200' },
          { label: 'Inactive', count: mockPlayers.filter(p => p.status === 'inactive').length, color: 'from-neutral-50 to-neutral-100 border-neutral-200' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 border`}>
            <p className="text-sm text-neutral-600">{stat.label}</p>
            <p className="text-2xl font-semibold text-neutral-900 mt-1">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Player Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Joined Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {paginatedPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-neutral-900">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      {player.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      {player.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-neutral-900">{player.totalBookings}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(player.status)}`}>
                      {player.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {new Date(player.joinedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredPlayers.length)} of {filteredPlayers.length} players
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-600" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
