import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, CheckCircle2, Shield, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { mockArenas } from '@/data/mockData';

export function HomePage() {
  const featuredArenas = mockArenas.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1760174012435-630a17a434ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBhcmVuYSUyMGFjdGlvbnxlbnwxfHx8fDE3Njg2Mjc2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080')",
        }}
      >
        <div className="container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Book Your Play Slot Before You Reach
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            Find and book the best sports arenas near you. No waiting, instant confirmation.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Location"
                  className="border-0 p-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Sport"
                  className="border-0 p-0 focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  className="border-0 p-0 focus-visible:ring-0"
                />
              </div>
            </div>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4 mr-2" />
              Search Arenas
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Sports */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Sports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Badminton',
                icon: '🏸',
                color: 'bg-blue-50 border-blue-200',
                count: '150+ Courts',
              },
              {
                name: 'Cricket',
                icon: '🏏',
                color: 'bg-green-50 border-green-200',
                count: '80+ Nets',
              },
              {
                name: 'Football',
                icon: '⚽',
                color: 'bg-orange-50 border-orange-200',
                count: '45+ Turfs',
              },
            ].map((sport) => (
              <Card
                key={sport.name}
                className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${sport.color}`}
              >
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">{sport.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{sport.name}</h3>
                  <p className="text-gray-600">{sport.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Arenas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Arenas</h2>
            <Link to="/arenas">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArenas.map((arena) => (
              <Link key={arena.id} to={`/arena/${arena.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        <Badge key={sport} variant="secondary" className="text-xs">
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
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ArenaBook</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'No Waiting Time',
                description:
                  'Book your slot in advance and walk straight into your court. No more waiting in queues.',
                color: 'text-green-600',
              },
              {
                icon: Zap,
                title: 'Instant Booking',
                description:
                  'Get instant confirmation and booking details. Pay online or at the venue.',
                color: 'text-blue-600',
              },
              {
                icon: Shield,
                title: 'Verified Arenas',
                description:
                  'All arenas are verified and rated by our community. Play with confidence.',
                color: 'text-purple-600',
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6 text-center">
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Arena Owners */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-emerald-50">Own a Sports Arena?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-emerald-100/90">
            List your arena on ArenaBook and reach thousands of sports enthusiasts. Manage
            bookings effortlessly with our platform.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-green-900 hover:bg-emerald-50 font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Register Your Arena
          </Button>
        </div>
      </section>
    </div>
  );
}