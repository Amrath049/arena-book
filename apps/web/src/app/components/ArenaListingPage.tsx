import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { arenaService } from '@/services/arena.service';

export function ArenaListingPage() {
  const [searchParams] = useSearchParams();
  const [arenas, setArenas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') ?? '');
  const [sportFilter, setSportFilter] = useState(searchParams.get('sport') ?? '');
  const [cityInput, setCityInput] = useState(searchParams.get('city') ?? '');
  const [sportInput, setSportInput] = useState(searchParams.get('sport') ?? '');

  useEffect(() => {
    setLoading(true);
    arenaService.listArenas({ city: cityFilter || undefined, sport: sportFilter || undefined }).then(r => {
      setArenas(r.data?.arenas ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [cityFilter, sportFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCityFilter(cityInput);
    setSportFilter(sportInput);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        <h1 className="text-3xl font-bold mb-6">Browse Sports Arenas</h1>
 
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8 w-full sm:w-auto sm:justify-end">
          <div className="relative w-full sm:w-64 max-w-none sm:max-w-xs">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={cityInput} onChange={e => setCityInput(e.target.value)}
              placeholder="Filter by city..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white" />
          </div>
          <div className="relative w-full sm:w-64 max-w-none sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={sportInput} onChange={e => setSportInput(e.target.value)}
              placeholder="Filter by sport..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial">Search</Button>
            {(cityFilter || sportFilter) && (
              <Button type="button" variant="outline" className="flex-1 sm:flex-initial" onClick={() => { setCityFilter(''); setSportFilter(''); setCityInput(''); setSportInput(''); }}>
                Clear
              </Button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-xl border h-64 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : arenas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No arenas found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {arenas.map(arena => (
              <Link key={arena.id} to={`/arena/${arena.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {arena.images?.[0] ? (
                      <img src={arena.images[0]} alt={arena.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-50">
                        <span className="text-4xl">🏟️</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{arena.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{arena.city}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {arena.gameTypes?.slice(0, 3).map((g: any) => (
                        <Badge key={g.id} variant="secondary" className="text-xs">{g.name}</Badge>
                      ))}
                      {arena.gameTypes?.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{arena.gameTypes.length - 3} more</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="py-8 bg-gray-950 border-t border-gray-800 text-center text-gray-400 text-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <p>&copy; {new Date().getFullYear()} ArenaBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
