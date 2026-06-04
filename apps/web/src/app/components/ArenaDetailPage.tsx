import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { mockArenas, mockMyArenas } from '@/data/mockData';

export function ArenaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const arena = mockArenas.find((a) => a.id === id);
  const [selectedDate, setSelectedDate] = useState('2026-01-20');
  const [selectedSport, setSelectedSport] = useState(arena?.sports[0] || '');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(mockMyArenas.includes(id || ''));

  if (!arena) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Arena not found</p>
      </div>
    );
  }

  const timeSlots = [
    { time: '06:00 - 07:00', status: 'available' },
    { time: '07:00 - 08:00', status: 'booked' },
    { time: '08:00 - 09:00', status: 'available' },
    { time: '09:00 - 10:00', status: 'available' },
    { time: '10:00 - 11:00', status: 'blocked' },
    { time: '11:00 - 12:00', status: 'available' },
    { time: '12:00 - 13:00', status: 'available' },
    { time: '13:00 - 14:00', status: 'booked' },
    { time: '14:00 - 15:00', status: 'available' },
    { time: '15:00 - 16:00', status: 'available' },
    { time: '16:00 - 17:00', status: 'available' },
    { time: '17:00 - 18:00', status: 'booked' },
    { time: '18:00 - 19:00', status: 'available' },
    { time: '19:00 - 20:00', status: 'available' },
    { time: '20:00 - 21:00', status: 'available' },
    { time: '21:00 - 22:00', status: 'booked' },
  ];

  const selectedCourt = arena.courts.find((c) => c.sport === selectedSport);

  const handleBookSlot = () => {
    if (selectedSlot && selectedCourt) {
      navigate('/booking', {
        state: {
          arena,
          sport: selectedSport,
          date: selectedDate,
          slot: selectedSlot,
          price: selectedCourt.pricePerHour,
        },
      });
    }
  };

  const handleJoinArena = () => {
    if (isJoined) {
      const updatedMyArenas = mockMyArenas.filter((arenaId) => arenaId !== id);
      mockMyArenas.length = 0;
      mockMyArenas.push(...updatedMyArenas);
      setIsJoined(false);
    } else {
      mockMyArenas.push(id || '');
      setIsJoined(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="w-full h-96 bg-gray-200">
        <img
          src={arena.image}
          alt={arena.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Arena Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{arena.name}</h1>
                <Button
                  onClick={() => {
                    if (isJoined) {
                      // Remove from myArenas
                      const index = mockMyArenas.indexOf(id || '');
                      if (index > -1) {
                        mockMyArenas.splice(index, 1);
                      }
                      setIsJoined(false);
                    } else {
                      // Add to myArenas
                      if (id && !mockMyArenas.includes(id)) {
                        mockMyArenas.push(id);
                      }
                      setIsJoined(true);
                    }
                  }}
                  variant={isJoined ? 'outline' : 'default'}
                  className={isJoined ? '' : 'bg-green-600 hover:bg-green-700'}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isJoined ? 'Leave Arena' : 'Join Arena'}
                </Button>
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{arena.location}, {arena.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{arena.rating}</span>
                  <span className="text-sm">({arena.reviews} reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {arena.sports.map((sport) => (
                  <Badge key={sport} variant="secondary">
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="courts">Courts & Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-gray-600 mb-6">{arena.description}</p>

                    {arena.ownerMessage && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Message from Owner</h4>
                        <p className="text-gray-700">{arena.ownerMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="facilities" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {arena.facilities.map((facility) => (
                        <div
                          key={facility}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{facility}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courts" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {arena.courts.map((court) => (
                        <div
                          key={court.sport}
                          className="flex justify-between items-center border-b pb-3"
                        >
                          <div>
                            <p className="font-semibold">{court.sport}</p>
                            <p className="text-sm text-gray-600">
                              {court.count} court{court.count > 1 ? 's' : ''} available
                            </p>
                          </div>
                          <p className="font-bold text-green-600">
                            ₹{court.pricePerHour}/hr
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Terms & Conditions */}
            {arena.terms && arena.terms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {arena.terms.map((term, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                        <span className="text-sm">{term}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Book Your Slot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                {/* Sport Selection */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Select Sport
                  </label>
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    {arena.sports.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Available Slots
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() =>
                          slot.status === 'available' && setSelectedSlot(slot.time)
                        }
                        disabled={slot.status !== 'available'}
                        className={`text-xs py-2 px-3 rounded-md border transition-colors ${
                          selectedSlot === slot.time
                            ? 'bg-green-600 text-white border-green-600'
                            : slot.status === 'available'
                            ? 'border-gray-300 hover:border-green-600 hover:bg-green-50'
                            : slot.status === 'booked'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-50 text-red-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          {slot.time.split(' - ')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs mt-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-gray-300 rounded" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gray-100 rounded" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-50 rounded" />
                      <span>Blocked</span>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                {selectedCourt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price per hour</span>
                      <span className="font-bold">₹{selectedCourt.pricePerHour}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={!selectedSlot}
                  onClick={handleBookSlot}
                >
                  Proceed to Book
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}