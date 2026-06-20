import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, Shield, Zap, ArrowRight, Star, Users, Building2, Trophy } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { arenaService } from '@/services/arena.service';

const SPORTS = [
  { name: 'Badminton', icon: '🏸', color: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700' },
  { name: 'Cricket',   icon: '🏏', color: 'from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700' },
  { name: 'Football',  icon: '⚽', color: 'from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700' },
  { name: 'Tennis',    icon: '🎾', color: 'from-yellow-50 to-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700' },
  { name: 'Basketball',icon: '🏀', color: 'from-red-50 to-red-100', border: 'border-red-200', text: 'text-red-700' },
  { name: 'Volleyball',icon: '🏐', color: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700' },
];

const WHY_US = [
  { icon: CheckCircle2, title: 'Instant Confirmation', desc: 'Book a slot and get instant confirmation. No phone calls, no back-and-forth.', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Zap,          title: 'Real-time Availability', desc: 'See live slot availability. What you see is what you get — no surprise "already booked" calls.', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Shield,       title: 'Secure Payments', desc: 'Pay safely via your ArenaBook wallet. Full refunds on eligible cancellations.', color: 'text-purple-600', bg: 'bg-purple-50' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [sport, setSport] = useState('');
  const [arenas, setArenas] = useState<any[]>([]);
  const [loadingArenas, setLoadingArenas] = useState(true);
  const [stats, setStats] = useState({ arenas: 0, cities: 0 });

  useEffect(() => {
    arenaService.listArenas({ limit: 6 }).then(r => {
      const list = r.data?.arenas ?? [];
      setArenas(list.slice(0, 3));
      const uniqueCities = new Set(list.map((a: any) => a.city)).size;
      setStats({ arenas: r.data?.total ?? list.length, cities: uniqueCities });
    }).catch(() => {}).finally(() => setLoadingArenas(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (sport) params.set('sport', sport);
    navigate(`/arenas?${params.toString()}`);
  };

  const handleSportClick = (sportName: string) => {
    navigate(`/arenas?sport=${encodeURIComponent(sportName)}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section
        className="relative min-h-[580px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(5,46,22,0.88) 0%, rgba(20,83,45,0.80) 50%, rgba(0,0,0,0.70) 100%), url('https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=1600&q=80')",
        }}
      >
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-300 text-sm font-medium">Book instantly, play instantly</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">
            Find & Book Sports<br />
            <span className="text-green-400">Arenas Near You</span>
          </h1>
          <p className="text-lg text-white/75 mb-10 max-w-xl mx-auto">
            Discover the best sports facilities in your city. Real-time availability, instant confirmation, zero hassle.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City (e.g. Bangalore)"
                  className="bg-transparent flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50">
                <Search className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  placeholder="Sport (e.g. Badminton)"
                  className="bg-transparent flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <Search className="h-4 w-4" /> Search Arenas
              </button>
            </div>
          </form>

          {/* Quick stats */}
          {stats.arenas > 0 && (
            <div className="flex items-center justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.arenas}+</div>
                <div className="text-green-300 text-xs">Arenas</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.cities}+</div>
                <div className="text-green-300 text-xs">Cities</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-green-300 text-xs">Digital</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Sports categories ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">Sports</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Browse by Sport</h2>
            <p className="text-gray-500 text-lg">Find the perfect arena for your game</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {SPORTS.map(sport => (
              <button
                key={sport.name}
                onClick={() => handleSportClick(sport.name)}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${sport.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                <div className="relative">
                  <div className="text-5xl mb-4 drop-shadow-sm">{sport.icon}</div>
                  <div className="font-semibold text-gray-800 group-hover:text-gray-900 text-sm">{sport.name}</div>
                  <div className={`mt-2 text-xs font-medium ${sport.text} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                    View arenas →
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Arenas ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Featured Arenas</h2>
              <p className="text-gray-500">Top-rated arenas on ArenaBook</p>
            </div>
            <Link to="/arenas" className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium text-sm">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loadingArenas ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : arenas.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No arenas listed yet.</p>
              <Link to="/arenas"><Button className="mt-4 bg-green-600 hover:bg-green-700">Browse Arenas</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {arenas.map((arena: any) => (
                <Link key={arena.id} to={`/arena/${arena.id}`} className="group">
                  <div className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      {arena.images?.[0] ? (
                        <img
                          src={arena.images[0]}
                          alt={arena.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 text-5xl">🏟️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                        {arena.gameTypes?.slice(0, 3).map((g: any) => (
                          <span key={g.id} className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-green-600 transition-colors">
                        {arena.name}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{arena.address ? `${arena.address}, ` : ''}{arena.city}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why ArenaBook ── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Why ArenaBook?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We make sports bookings effortless — for players and arena owners alike</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_US.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Book in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: '01', title: 'Find an Arena', desc: 'Search by city or sport. Browse real-time slot availability.', icon: Search },
              { step: '02', title: 'Pick a Slot', desc: 'Choose your preferred date, time and court.', icon: Trophy },
              { step: '03', title: 'Pay & Play', desc: 'Confirm via your wallet. Get instant booking confirmation.', icon: CheckCircle2 },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+48px)] right-0 h-px border-t-2 border-dashed border-gray-200" />
                )}
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/arenas">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 rounded-xl">
                Book Your Slot Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Arena owner CTA ── */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/20 rounded-2xl mb-6">
            <Building2 className="h-7 w-7 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Own a Sports Arena?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            List your arena, manage courts, set pricing — all in one place. Join hundreds of arena owners already on ArenaBook.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="https://arena-book-admin.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 rounded-xl font-semibold">
                Get Started Free
              </Button>
            </Link>
            <Link to="/arenas">
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10 px-8 rounded-xl">
                Browse as Player
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
