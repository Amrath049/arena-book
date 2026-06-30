import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Heart, HeartOff, Images, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { arenaService } from '@/services/arena.service';
import { slotService } from '@/services/slot.service';
import { playerService } from '@/services/player.service';
import { useAuth } from '@/contexts/AuthContext';

export function ArenaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [arena, setArena] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGameTypeId, setSelectedGameTypeId] = useState('');
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    arenaService.getArenaDetail(id).then(r => {
      const a = r.data;
      setArena(a);
      if (a.gameTypes?.length) {
        const firstGame = a.gameTypes[0];
        setSelectedGameTypeId(firstGame.id);
        if (firstGame.courts?.length) setSelectedCourtId(firstGame.courts[0].id);
      }
    }).catch(console.error).finally(() => setLoading(false));

    if (isAuthenticated) {
      playerService.getFavourites().then(r => {
        const favs = r.data ?? [];
        setIsFavourite(favs.some((f: any) => f.arenaId === id));
      }).catch(() => {});
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!selectedCourtId || !selectedDate) { setSlots([]); return; }
    setLoadingSlots(true);
    slotService.getAvailableSlots(selectedCourtId, selectedDate).then(r => {
      setSlots(r.data ?? []);
      setSelectedSlot(null);
    }).catch(console.error).finally(() => setLoadingSlots(false));
  }, [selectedCourtId, selectedDate]);

  const toggleFavourite = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setFavLoading(true);
    try {
      if (isFavourite) {
        await playerService.leaveArena(id!);
        setIsFavourite(false);
      } else {
        await playerService.joinArena(id!);
        setIsFavourite(true);
      }
    } catch { } finally {
      setFavLoading(false);
    }
  };

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!selectedSlot) return;
    navigate('/booking', {
      state: {
        arenaId: id,
        arenaName: arena.name,
        courtId: selectedCourtId,
        courtName: arena.gameTypes.find((g: any) => g.id === selectedGameTypeId)?.courts?.find((c: any) => c.id === selectedCourtId)?.name,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        price: selectedSlot.price,
      },
    });
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50/50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;
  if (!arena) return <div className="flex items-center justify-center min-h-screen bg-slate-50/50"><p className="text-slate-500 font-medium">Arena not found</p></div>;

  const selectedGame = arena.gameTypes?.find((g: any) => g.id === selectedGameTypeId);
  const images: string[] = arena.images?.filter(Boolean) ?? [];
  const hasImages = images.length > 0;

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setLightboxIndex(i => (i - 1 + images.length) % images.length);
  const nextImage = () => setLightboxIndex(i => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Background Glows */}
      <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      {/* ── Image Gallery ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 w-full relative z-10">
        {!hasImages ? (
          <div className="w-full h-72 rounded-2xl bg-emerald-50 flex items-center justify-center text-7xl border border-emerald-100/60 shadow-inner">
            🏟️
          </div>
        ) : images.length === 1 ? (
          <div className="w-full h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md" onClick={() => openLightbox(0)}>
            <img src={images[0]} alt={arena.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-2 h-80 rounded-2xl overflow-hidden shadow-md">
            {images.slice(0, 2).map((img, i) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => openLightbox(i)}>
                <img src={img} alt={`${arena.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative grid grid-cols-4 grid-rows-2 gap-2 h-80 rounded-2xl overflow-hidden shadow-md">
            <div className="col-span-2 row-span-2 overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
              <img src={images[0]} alt={arena.name} className="w-full h-full object-cover hover:brightness-95 transition-all duration-200" />
            </div>
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => openLightbox(i + 1)}>
                <img src={img} alt={`${arena.name} ${i + 2}`} className="w-full h-full object-cover hover:brightness-95 transition-all duration-200" />
              </div>
            ))}
            {images.length > 1 && (
              <button
                onClick={() => openLightbox(0)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-slate-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-lg hover:bg-slate-50 border border-slate-200/80 cursor-pointer"
              >
                <Images className="w-4 h-4 text-emerald-600" />
                View all {images.length} photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-slate-300 z-10 cursor-pointer">
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 transition-all cursor-pointer"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
          <div className="max-w-4xl max-h-[75vh] w-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={images[lightboxIndex]}
              alt={`${arena.name} ${lightboxIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
            />
            <p className="text-center text-slate-400 text-sm mt-4 font-medium">{lightboxIndex + 1} / {images.length}</p>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 overflow-x-auto max-w-full px-4 py-1">
              {images.map((img, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${i === lightboxIndex ? 'border-emerald-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Main Details Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-10 w-full flex-grow relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{arena.name}</h1>
                <div className="flex items-center gap-1.5 text-slate-500 mt-2 text-sm font-medium">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" />
                  <span>{arena.address}, {arena.city}</span>
                </div>
              </div>
              <Button variant="outline" onClick={toggleFavourite} disabled={favLoading} className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer self-start">
                {isFavourite ? <HeartOff className="h-4.5 w-4.5 text-red-500" /> : <Heart className="h-4.5 w-4.5 text-slate-500" />}
                {isFavourite ? 'Unfavourite' : 'Add to Favourites'}
              </Button>
            </div>

            <Tabs defaultValue="about">
              <TabsList className="border border-slate-200 bg-slate-100/80 p-1 rounded-xl">
                <TabsTrigger value="about" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">About</TabsTrigger>
                <TabsTrigger value="sports" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Sports & Courts</TabsTrigger>
                {arena.terms && <TabsTrigger value="terms" className="rounded-lg font-semibold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">Terms</TabsTrigger>}
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-slate-700 leading-relaxed text-sm">{arena.description || 'No description available.'}</p>
                  {arena.customMsg && (
                    <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100/60 shadow-sm">
                      <p className="text-emerald-800 text-xs font-semibold leading-relaxed">{arena.customMsg}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sports" className="mt-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
                  {arena.gameTypes?.map((game: any) => (
                    <div key={game.id} className="border-b last:border-b-0 pb-4 last:pb-0 border-slate-100">
                      <h4 className="font-bold text-slate-800 mb-2.5 text-sm uppercase tracking-wider">{game.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.courts?.map((court: any) => (
                          <Badge key={court.id} variant="secondary" className="text-xs bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1">
                            {court.name} ({court.slotDuration} min)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {arena.terms && (
                <TabsContent value="terms" className="mt-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{arena.terms}</p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* ── Booking Panel Sidebar ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl shadow-slate-100/60 space-y-5">
              <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">Book a Slot</h3>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sport</label>
                <select value={selectedGameTypeId} onChange={e => {
                  setSelectedGameTypeId(e.target.value);
                  const game = arena.gameTypes.find((g: any) => g.id === e.target.value);
                  if (game?.courts?.length) setSelectedCourtId(game.courts[0].id);
                  else setSelectedCourtId('');
                }} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 outline-none hover:bg-slate-100/50 cursor-pointer font-medium text-slate-700">
                  {arena.gameTypes?.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {selectedGame?.courts?.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Court</label>
                  <select value={selectedCourtId} onChange={e => setSelectedCourtId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 outline-none hover:bg-slate-100/50 cursor-pointer font-medium text-slate-700">
                    {selectedGame.courts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 outline-none hover:bg-slate-100/50 cursor-pointer font-medium text-slate-700" />
              </div>

              {selectedCourtId && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Available Slots</label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse border border-slate-100" />)}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium">No slots defined for this day.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                        {slots.map((slot, i) => {
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          const isAvailable = slot.status === 'AVAILABLE';
                          const isBooked = slot.status === 'BOOKED';
                          const isBlocked = slot.status === 'BLOCKED';

                          return (
                            <button
                              key={i}
                              onClick={() => isAvailable && setSelectedSlot(slot)}
                              disabled={!isAvailable}
                              className={`relative p-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-1
                                ${isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                                  : isAvailable
                                    ? 'bg-white border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-sm cursor-pointer text-slate-700'
                                    : isBooked
                                      ? 'bg-red-50/60 border-red-100 text-red-400 cursor-not-allowed'
                                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <circle cx="12" cy="12" r="10" strokeWidth="2.5"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6l4 2"/>
                                </svg>
                                <span>{slot.startTime}</span>
                              </div>
                              {isAvailable && !isSelected && (
                                <div className="text-slate-500 font-medium">₹{slot.price}</div>
                              )}
                              {isSelected && <div className="text-emerald-100 font-medium">₹{slot.price}</div>}
                              {isBooked && <div className="text-red-400/80 text-[10px]">Booked</div>}
                              {isBlocked && <div className="text-slate-300 text-[10px]">Blocked</div>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                          <div className="w-2.5 h-2.5 rounded-md border border-slate-300 bg-white" />
                          Available
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                          <div className="w-2.5 h-2.5 rounded-md border border-red-100 bg-red-50/60" />
                          Booked
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                          <div className="w-2.5 h-2.5 rounded-md border border-slate-200 bg-slate-50" />
                          Blocked
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase">
                          <div className="w-2.5 h-2.5 rounded-md bg-emerald-600" />
                          Selected
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100/40 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Selected Time:</span>
                    <span className="font-bold text-slate-800">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-emerald-100/30">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-extrabold text-emerald-700 text-base">₹{selectedSlot.price}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleBook} disabled={!selectedSlot}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50">
                {isAuthenticated ? 'Book Now' : 'Login to Book'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
