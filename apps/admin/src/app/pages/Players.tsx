import { useState, useEffect, useCallback } from 'react';
import { Search, User, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { playersService } from '@/services/players.service';

export function Players() {
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback((page = 1, q = '') => {
    setLoading(true);
    playersService.getPlayers(q || undefined, page, 10).then(res => {
      const d = res.data;
      setPlayers(d.players ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
      setCurrentPage(page);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlayers(1, search); }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Players</h2>
          <p className="text-neutral-600 mt-1">Manage registered players</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium text-blue-700">
          {total} Players
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                {['Player', 'Phone', 'Email', 'Wallet', 'Bookings', 'Joined'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">Loading...</td></tr>
              ) : players.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-neutral-500">No players found</td></tr>
              ) : players.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-neutral-900">{p.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{p.phone || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{p.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 font-medium">₹{p.walletBalance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{p._count?.bookings ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {new Date(p.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">Page {currentPage} of {pages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPlayers(currentPage - 1, search)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => fetchPlayers(currentPage + 1, search)}
                disabled={currentPage === pages}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
