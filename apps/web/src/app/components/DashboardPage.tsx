import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Wallet, Heart, Clock, MapPin, Plus, Star } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { mockBookings, mockTransactions, mockMyArenas, mockArenas } from '@/data/mockData';
import { ProfileCard } from '@/app/components/ProfileCard';

export function DashboardPage() {
  const [walletBalance, setWalletBalance] = useState(1100);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMoneyError, setAddMoneyError] = useState('');

  function handleAddMoney() {
    const amt = Number(addAmount);
    if (!addAmount || isNaN(amt) || amt <= 0) {
      setAddMoneyError('Please enter a valid amount.');
      return;
    }
    if (amt < 10) {
      setAddMoneyError('Minimum amount is ₹10.');
      return;
    }
    setWalletBalance((prev) => prev + amt);
    setShowAddMoney(false);
    setAddAmount('');
    setAddMoneyError('');
  }
  const upcomingBookings = mockBookings.filter((b) => b.status === 'upcoming');
  const pastBookings = mockBookings.filter((b) => b.status === 'completed');
  const myArenas = mockArenas.filter((a) => mockMyArenas.includes(a.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-green-600">₹{walletBalance}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {showAddMoney ? (
                <div className="mt-4 space-y-2">
                  <input
                    type="number"
                    min={10}
                    placeholder="Enter amount (₹)"
                    value={addAmount}
                    onChange={(e) => { setAddAmount(e.target.value); setAddMoneyError(''); }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  {addMoneyError && <p className="text-xs text-red-500">{addMoneyError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleAddMoney}>
                      Proceed
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setShowAddMoney(false); setAddAmount(''); setAddMoneyError(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => setShowAddMoney(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Money
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Upcoming Bookings</p>
                  <p className="text-3xl font-bold">{upcomingBookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Arenas</p>
                  <p className="text-3xl font-bold">{myArenas.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="myarenas">My Arenas</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Bookings</h2>
              {upcomingBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No upcoming bookings</p>
                    <Link to="/arenas">
                      <Button>Browse Arenas</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg">{booking.arenaName}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary">{booking.sport}</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(booking.date).toLocaleDateString('en-IN')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {booking.time}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-2xl font-bold text-green-600">
                              ₹{booking.price}
                            </p>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-8">
              <h2 className="text-xl font-bold mb-4">Past Bookings</h2>
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No past bookings</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id} className="opacity-75">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg">{booking.arenaName}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <Badge variant="outline">{booking.sport}</Badge>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(booking.date).toLocaleDateString('en-IN')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {booking.time}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-xl font-bold">₹{booking.price}</p>
                            <Badge>Completed</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <p
                        className={`font-bold ${
                          transaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}₹
                        {transaction.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="myarenas">
            {myArenas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven't joined any arenas yet</p>
                  <Link to="/arenas">
                    <Button>Browse Arenas</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myArenas.map((arena) => (
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
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-2xl">
              <ProfileCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}