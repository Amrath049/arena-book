import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">

      {/* Background Accent Glows */}
      <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow relative z-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-2">
          Browse Sports Arenas
        </h1>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto sm:justify-end">
          <div className="relative w-full sm:w-64 max-w-none sm:max-w-xs">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            <input type="text" value={cityInput} onChange={e => setCityInput(e.target.value)}
              placeholder="Filter by city..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
          </div>
          <div className="relative w-full sm:w-64 max-w-none sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            <input type="text" value={sportInput} onChange={e => setSportInput(e.target.value)}
              placeholder="Filter by sport..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-sm" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 flex-1 sm:flex-initial shadow-md shadow-emerald-600/10 cursor-pointer">Search</Button>
            {(cityFilter || sportFilter) && (
              <Button type="button" variant="outline" className="border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex-1 sm:flex-initial cursor-pointer shadow-sm" onClick={() => { setCityFilter(''); setSportFilter(''); setCityInput(''); setSportInput(''); }}>
                Clear
              </Button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 h-64 animate-pulse flex flex-col shadow-sm">
                <div className="h-40 bg-slate-100 rounded-t-xl" />
                <div className="p-4 space-y-2 flex-grow">
                  <div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : arenas.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl max-w-xl mx-auto shadow-sm">
            <p className="text-slate-500 font-medium">No arenas found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {arenas.map(arena => (
              <Link key={arena.id} to={`/arena/${arena.id}`} className="group">
                <Card className="hover:shadow-xl hover:shadow-slate-100/50 hover:border-emerald-500/20 transition-all hover:-translate-y-1.5 duration-300 bg-white border-slate-100 text-slate-800 overflow-hidden cursor-pointer flex flex-col h-full">
                  <div className="h-48 bg-slate-50 overflow-hidden relative">
                    {arena.images?.[0] ? (
                      <img src={arena.images[0]} alt={arena.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <span className="text-4xl">🏟️</span>
                      </div>
                    )}
                    {/* Instant Book Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 text-emerald-800 border border-slate-100 text-[10px] font-bold px-2.5 py-1.5 rounded-full tracking-wider shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> INSTANT
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-1">{arena.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{arena.city}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {arena.gameTypes?.slice(0, 3).map((g: any) => (
                        <Badge key={g.id} variant="secondary" className="text-[10px] bg-slate-100 border border-slate-200/40 text-slate-600 font-bold px-2 py-0.5 rounded-full">{g.name}</Badge>
                      ))}
                      {arena.gameTypes?.length > 3 && (
                        <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-full">+{arena.gameTypes.length - 3} more</Badge>
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
      <footer className="py-10 bg-slate-950 text-center text-slate-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-extrabold text-slate-300 tracking-wider">ARENA•BOOK</span>
          </div>
          <p className="mb-2 font-medium">Elevating the sports infrastructure digital ecosystem.</p>
          <p className="text-slate-500">&copy; {new Date().getFullYear()} ArenaBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
