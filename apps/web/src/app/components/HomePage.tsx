import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, Shield, Zap, ArrowRight, Trophy, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { arenaService } from '@/services/arena.service';

const SPORTS = [
  {
    name: 'Badminton',
    icon: (
      <svg className="w-10 h-10 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15.5" cy="8.5" r="5" />
        <path d="M12 12l-8.5 8.5M3 21l1.5-1.5" />
        <path d="M17 7l-3 3" />
        <path d="M14.5 5.5l3 3" />
        <path d="M8 8a2.5 2.5 0 0 1 3.5 0l.5.5-4 4-.5-.5A2.5 2.5 0 0 1 8 8z" />
      </svg>
    ),
    color: 'hover:border-emerald-500/20 hover:shadow-emerald-500/5',
    text: 'text-emerald-600'
  },
  {
    name: 'Cricket',
    icon: (
      <svg className="w-10 h-10 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="4" width="2" height="16" rx="0.5" />
        <rect x="11" y="4" width="2" height="16" rx="0.5" />
        <rect x="17" y="4" width="2" height="16" rx="0.5" />
        <rect x="4" y="2" width="8" height="1.5" rx="0.5" />
        <rect x="12" y="2" width="8" height="1.5" rx="0.5" />
        <circle cx="19" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
    color: 'hover:border-emerald-500/20 hover:shadow-emerald-500/5',
    text: 'text-emerald-600'
  },
  {
    name: 'Football',
    icon: (
      <svg className="w-10 h-10 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
    color: 'hover:border-emerald-500/20 hover:shadow-emerald-500/5',
    text: 'text-emerald-600'
  },
  {
    name: 'Tennis',
    icon: (
      <svg className="w-10 h-10 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="7.5" r="4.5" />
        <path d="M10.5 10.5L18 18" />
        <circle cx="16.5" cy="7.5" r="4.5" />
        <path d="M13.5 10.5L6 18" />
        <circle cx="12" cy="17" r="1.2" fill="currentColor" />
      </svg>
    ),
    color: 'hover:border-emerald-500/20 hover:shadow-emerald-500/5',
    text: 'text-emerald-600'
  },
  {
    name: 'Basketball',
    icon: (
      <svg className="w-10 h-10 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="7" rx="8" ry="3" />
        <path d="M4 7c0 5 3 13 8 13s8-8 8-13" />
        <path d="M8 8.5c1 3.5 2 7.5 4 7.5s3-4 4-7.5" />
        <path d="M12 4v3" />
      </svg>
    ),
    color: 'hover:border-emerald-500/20 hover:shadow-emerald-500/5',
    text: 'text-emerald-600'
  },
  {
    name: 'Volleyball',
    icon: (
      <svg className="w-10 h-10 text-emerald-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M6 6a8.5 8.5 0 0 0 12 12" />
        <path d="M18 6A8.5 8.5 0 0 0 6 12.5" />
        <path d="M12 2v20" />
      </svg>
    ),
    color: 'hover:border-emerald-500/20 hover:shadow-emerald-500/5',
    text: 'text-emerald-600'
  },
];

const WHY_US = [
  { icon: CheckCircle2, title: 'Instant Booking', desc: 'Secure slot reservation with absolute instant confirmation. No calls, no delays.', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  { icon: Zap,          title: 'Live Slots', desc: 'Real-time dashboard reflecting actual court availability. Dynamic sync.', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
  { icon: Shield,       title: 'Cancel Policy', desc: 'Effortless payment transactions with instant refunds on compliant cancellations.', color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 border-fuchsia-100' },
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
      setArenas(list.slice(0, 4));
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
    <div className="min-h-screen bg-slate-50/50 text-slate-800 selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">

      {/* Background Accent Glows */}
      <div className="absolute top-[620px] left-10 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      {/* ── Hero Section ── */}
      <section
        className="relative min-h-[620px] flex items-center justify-center overflow-hidden border-b border-slate-100"
        style={{
          backgroundImage: "linear-gradient(135deg, #e6f9f0 0%, #f1fbf7 50%, #f8fafc 100%)",
        }}
      >
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-400/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Soft grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-20 text-center z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">Book Instantly. Play Today.</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-5 leading-tight tracking-tight">
            Elevate Your Game.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 drop-shadow-sm">Book Arenas Instantly.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 mb-10 max-w-xl mx-auto font-medium">
            Discover and secure premium sports courts in your city. Real-time slot reservation, digital validation, zero delay.
          </p>

          {/* Search box panel */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-100 p-3 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all focus-within:bg-white focus-within:border-emerald-500/50">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City (e.g. Bangalore)"
                  className="bg-transparent flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all focus-within:bg-white focus-within:border-emerald-500/50">
                <Search className="h-4 w-4 text-emerald-500 shrink-0" />
                <input
                  type="text"
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  placeholder="Sport (e.g. Badminton)"
                  className="bg-transparent flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap shadow-md shadow-emerald-600/10 active:scale-95 cursor-pointer"
              >
                <Search className="h-4 w-4" /> Find Court
              </button>
            </div>
          </form>

          {/* Quick stats digital display */}
          {stats.arenas > 0 && (
            <div className="flex items-center justify-center gap-10 mt-12 bg-white border border-slate-100/80 shadow-sm rounded-2xl p-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.arenas}+</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Arenas Live</div>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.cities}+</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Cities Active</div>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-600 tracking-tight">100%</div>
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5">Digital Sync</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Sports Categories ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">Categories</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Browse by Sport</h2>
            <p className="text-slate-500 text-base max-w-md mx-auto">Find and book the absolute perfect court space for your game.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {SPORTS.map(sport => (
              <button
                key={sport.name}
                onClick={() => handleSportClick(sport.name)}
                className="group relative bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center shadow-sm hover:border-emerald-500/20 hover:bg-white hover:shadow-md hover:shadow-slate-100/80 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="relative flex flex-col items-center justify-center">
                  <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-xl bg-white border border-slate-200/60 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                    {sport.icon}
                  </div>
                  <div className="font-bold text-slate-700 group-hover:text-emerald-600 text-sm transition-colors">{sport.name}</div>
                  <div className="mt-2 text-[10px] uppercase font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Book Now
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Arenas ── */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden border-y border-slate-100">
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full mb-3">Top Rated</span>
              <h2 className="text-3xl font-extrabold text-slate-900">Featured Arenas</h2>
              <p className="text-slate-500 text-sm mt-1">Premium and verified court spaces listing live availability.</p>
            </div>
            <Link to="/arenas">
              <Button variant="outline" className="border-slate-200 hover:border-emerald-500/40 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-full px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 bg-white shadow-sm cursor-pointer">
                View All Arenas <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>

          {loadingArenas ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm animate-pulse h-[310px] flex flex-col">
                  <div className="h-52 bg-slate-100" />
                  <div className="p-4 space-y-2 flex-grow">
                    <div className="h-5 bg-slate-100 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : arenas.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl max-w-xl mx-auto shadow-sm">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No arenas listed yet.</p>
              <Link to="/arenas"><Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2">Browse Arenas</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {arenas.map((arena: any) => (
                <Link key={arena.id} to={`/arena/${arena.id}`} className="group">
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white hover:border-emerald-500/20 hover:shadow-lg hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-52 overflow-hidden bg-slate-50">
                      {arena.images?.[0] ? (
                        <img
                          src={arena.images[0]}
                          alt={arena.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-5xl">🏟️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {/* Premium Instant Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/95 text-emerald-800 border border-slate-100 text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> INSTANT BOOK
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
                        {arena.gameTypes?.slice(0, 3).map((g: any) => (
                          <span key={g.id} className="bg-slate-900/70 border border-white/10 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between bg-white border-t border-slate-50">
                      <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-emerald-600 transition-colors mb-2 line-clamp-1">
                        {arena.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
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
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">Benefits</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Designed for the Game</h2>
            <p className="text-slate-500 text-base max-w-sm mx-auto">We streamline physical bookings with premium digital workflows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_US.map(f => (
              <div key={f.title} className="bg-slate-50/50 rounded-2xl p-7 border border-slate-100 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-slate-100/40 transition-all duration-300">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 border`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works Timeline ── */}
      <section className="py-24 bg-slate-50/50 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4">Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Book in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto relative z-10">
            {[
              { step: '01', title: 'Pick an Arena', desc: 'Browse available courts filtering by sport or city listing real-time availability.', icon: Search },
              { step: '02', title: 'Select Your Slot', desc: 'Secure the specific date, duration, court, and time window pricing.', icon: Trophy },
              { step: '03', title: 'Unlock & Play', desc: 'Transact digitally using your ArenaBook wallet and receive immediate booking confirmation.', icon: CheckCircle2 },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center bg-white border border-slate-100 p-6 rounded-2xl shadow-sm shadow-slate-100/50">
                {i < 2 && (
                  <div className="hidden md:block absolute top-[44px] left-[calc(50%+45px)] w-[120px] h-[2px] bg-gradient-to-r from-emerald-500/20 to-emerald-500/5" />
                )}
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-4 shadow-md shadow-emerald-600/15">
                  {s.step}
                </div>
                <h3 className="font-extrabold text-slate-900 mb-2 text-base">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/arenas">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all cursor-pointer">
                Book Your Slot Now <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Premium Owner CTA Banner ── */}
      <section className="py-24 bg-gradient-to-br from-[#042f2e] via-[#064e3b] to-[#022c22] text-white relative overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.015)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.015)_50%,rgba(255,255,255,0.015)_75%,transparent_75%,transparent)] bg-[size:1rem_1rem] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10 w-full">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 border border-white/20 rounded-2xl mb-6 shadow-inner">
            <Building2 className="h-6 w-6 text-emerald-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Own a Sports Arena?</h2>
          <p className="text-emerald-200/60 mb-8 max-w-lg mx-auto text-sm md:text-base font-medium">
            List your courts, manage booking reservations, define pricing slots — all inside your customized admin command dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="https://arena-book-admin.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer text-sm">
                Get Started Free
              </Button>
            </Link>
            <Link to="/arenas">
              <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-emerald-400/30 px-8 py-3.5 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer text-sm">
                Browse as Player
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 bg-slate-950 text-center text-slate-400 text-xs">
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
