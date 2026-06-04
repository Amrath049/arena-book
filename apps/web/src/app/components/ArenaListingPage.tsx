import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { mockArenas } from '@/data/mockData';

export function ArenaListingPage() {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 3000]);

  const sports = ['Badminton', 'Cricket', 'Football'];

  const filteredArenas = mockArenas.filter((arena) => {
    const sportMatch =
      selectedSports.length === 0 ||
      arena.sports.some((sport) => selectedSports.includes(sport));
    const priceMatch =
      arena.startingPrice >= priceRange[0] && arena.startingPrice <= priceRange[1];
    return sportMatch && priceMatch;
  });

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Sports Arenas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal className="h-5 w-5" />
                  <h2 className="font-bold text-lg">Filters</h2>
                </div>

                {/* Sport Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Sport</h3>
                  <div className="space-y-2">
                    {sports.map((sport) => (
                      <div key={sport} className="flex items-center gap-2">
                        <Checkbox
                          id={sport}
                          checked={selectedSports.includes(sport)}
                          onCheckedChange={() => toggleSport(sport)}
                        />
                        <Label htmlFor={sport} className="cursor-pointer">
                          {sport}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Price Range (per hour)</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={3000}
                      step={100}
                      className="mb-4"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedSports([]);
                    setPriceRange([0, 3000]);
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Arena Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                {filteredArenas.length} arena(s) found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredArenas.map((arena) => (
                <Link key={arena.id} to={`/arena/${arena.id}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={arena.image}
                        alt={arena.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        ⭐ {arena.rating}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{arena.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {arena.location}, {arena.city}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {arena.sports.map((sport) => (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className="text-xs"
                          >
                            {sport}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {arena.reviews} reviews
                        </span>
                        <span className="font-bold text-green-600">
                          From ₹{arena.startingPrice}/hr
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredArenas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No arenas found matching your filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedSports([]);
                    setPriceRange([0, 3000]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
