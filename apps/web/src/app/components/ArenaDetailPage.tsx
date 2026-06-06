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

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!arena) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Arena not found</p></div>;

  const selectedGame = arena.gameTypes?.find((g: any) => g.id === selectedGameTypeId);
  const images: string[] = arena.images?.filter(Boolean) ?? [];
  const hasImages = images.length > 0;

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () => setLightboxIndex(i => (i - 1 + images.length) % images.length);
  const nextImage = () => setLightboxIndex(i => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Image Gallery ── */}
      <div className="container mx-auto px-4 pt-6">
        {!hasImages ? (
          <div className="w-full h-72 rounded-2xl bg-green-50 flex items-center justify-center text-7xl border border-green-100">
            🏟️
          </div>
        ) : images.length === 1 ? (
          /* Single image — full width */
          <div className="w-full h-80 rounded-2xl overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
            <img src={images[0]} alt={arena.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        ) : images.length === 2 ? (
          /* Two images — 50/50 */
          <div className="grid grid-cols-2 gap-2 h-80 rounded-2xl overflow-hidden">
            {images.slice(0, 2).map((img, i) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => openLightbox(i)}>
                <img src={img} alt={`${arena.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        ) : (
          /* 3+ images — Airbnb style: big left + grid right */
          <div className="relative grid grid-cols-4 grid-rows-2 gap-2 h-80 rounded-2xl overflow-hidden">
            {/* Main large image */}
            <div className="col-span-2 row-span-2 overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
              <img src={images[0]} alt={arena.name} className="w-full h-full object-cover hover:brightness-90 transition-all duration-200" />
            </div>
            {/* Up to 4 smaller images */}
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => openLightbox(i + 1)}>
                <img src={img} alt={`${arena.name} ${i + 2}`} className="w-full h-full object-cover hover:brightness-90 transition-all duration-200" />
              </div>
            ))}
            {/* "View all" button */}
            {images.length > 1 && (
              <button
                onClick={() => openLightbox(0)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:bg-gray-50 border border-gray-200"
              >
                <Images className="w-4 h-4" />
                View all {images.length} photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/40 rounded-full p-2"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/40 rounded-full p-2"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full px-16" onClick={e => e.stopPropagation()}>
            <img
              src={images[lightboxIndex]}
              alt={`${arena.name} ${lightboxIndex + 1}`}
              className="w-full h-full object-contain max-h-[75vh] rounded-lg"
            />
            <p className="text-center text-gray-400 text-sm mt-3">{lightboxIndex + 1} / {images.length}</p>
          </div>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                  className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{arena.name}</h1>
                <div className="flex items-center gap-1 text-gray-500 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{arena.address}, {arena.city}</span>
                </div>
              </div>
              <Button variant="outline" onClick={toggleFavourite} disabled={favLoading} className="gap-2">
                {isFavourite ? <HeartOff className="h-4 w-4 text-red-500" /> : <Heart className="h-4 w-4" />}
                {isFavourite ? 'Unfavourite' : 'Add to Favourites'}
              </Button>
            </div>

            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="sports">Sports & Courts</TabsTrigger>
                {arena.terms && <TabsTrigger value="terms">Terms</TabsTrigger>}
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <div className="bg-white rounded-xl p-6 border">
                  <p className="text-gray-700">{arena.description || 'No description available.'}</p>
                  {arena.customMsg && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 text-sm">{arena.customMsg}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sports" className="mt-4">
                <div className="bg-white rounded-xl p-6 border space-y-4">
                  {arena.gameTypes?.map((game: any) => (
                    <div key={game.id}>
                      <h4 className="font-semibold text-gray-900 mb-2">{game.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.courts?.map((court: any) => (
                          <Badge key={court.id} variant="secondary">{court.name} ({court.slotDuration} min)</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {arena.terms && (
                <TabsContent value="terms" className="mt-4">
                  <div className="bg-white rounded-xl p-6 border">
                    <p className="text-gray-700 whitespace-pre-wrap">{arena.terms}</p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
              <h3 className="font-bold text-lg">Book a Slot</h3>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sport</label>
                <select value={selectedGameTypeId} onChange={e => {
                  setSelectedGameTypeId(e.target.value);
                  const game = arena.gameTypes.find((g: any) => g.id === e.target.value);
                  if (game?.courts?.length) setSelectedCourtId(game.courts[0].id);
                  else setSelectedCourtId('');
                }} className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  {arena.gameTypes?.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {selectedGame?.courts?.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Court</label>
                  <select value={selectedCourtId} onChange={e => setSelectedCourtId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-green-500 outline-none">
                    {selectedGame.courts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              {selectedCourtId && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Available Slots</label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-gray-500">No slots defined for this day.</p>
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
                              className={`relative p-2.5 rounded-lg text-xs font-medium border transition-all
                                ${isSelected
                                  ? 'bg-green-600 text-white border-green-600 shadow-md scale-[1.02]'
                                  : isAvailable
                                    ? 'bg-white border-gray-200 hover:border-green-500 hover:bg-green-50 hover:shadow-sm cursor-pointer'
                                    : isBooked
                                      ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
                                      : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                            >
                              <div className="flex items-center justify-center gap-1 mb-0.5">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/>
                                </svg>
                                <span>{slot.startTime}</span>
                              </div>
                              {isAvailable && !isSelected && (
                                <div className="text-gray-500">₹{slot.price}</div>
                              )}
                              {isSelected && <div className="text-green-100">₹{slot.price}</div>}
                              {isBooked && <div className="text-red-300 text-[10px]">Booked</div>}
                              {isBlocked && <div className="text-gray-300 text-[10px]">Blocked</div>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="w-3 h-3 rounded border border-gray-300 bg-white" />
                          Available
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="w-3 h-3 rounded border border-red-200 bg-red-50" />
                          Booked
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="w-3 h-3 rounded border border-gray-200 bg-gray-50" />
                          Blocked
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="w-3 h-3 rounded bg-green-600" />
                          Selected
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedSlot && (
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selected:</span>
                    <span className="font-medium">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-700">₹{selectedSlot.price}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleBook} disabled={!selectedSlot}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50">
                {isAuthenticated ? 'Book Now' : 'Login to Book'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
