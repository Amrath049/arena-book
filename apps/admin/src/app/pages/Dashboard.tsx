import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const stats = [
  {
    name: "Today's Bookings",
    value: '12',
    change: '+2 from yesterday',
    icon: Calendar,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Daily Revenue',
    value: '₹8,450',
    change: '+12% from yesterday',
    icon: DollarSign,
    color: 'bg-green-50 text-green-600',
  },
  {
    name: 'Active Courts',
    value: '6/8',
    change: '2 courts in use',
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    name: 'Monthly Revenue',
    value: '₹1,24,500',
    change: '+18% from last month',
    icon: TrendingUp,
    color: 'bg-orange-50 text-orange-600',
  },
];

const todayBookings = [
  { id: 1, time: '06:00 AM', customer: 'Rahul Sharma', court: 'Badminton Court 1', status: 'Confirmed', amount: '₹500' },
  { id: 2, time: '07:00 AM', customer: 'Priya Patel', court: 'Cricket Net 1', status: 'Confirmed', amount: '₹800' },
  { id: 3, time: '08:00 AM', customer: 'Amit Kumar', court: 'Badminton Court 2', status: 'Pending', amount: '₹500' },
  { id: 4, time: '09:00 AM', customer: 'Sneha Reddy', court: 'Cricket Net 2', status: 'Confirmed', amount: '₹800' },
  { id: 5, time: '10:00 AM', customer: 'Vikram Singh', court: 'Badminton Court 1', status: 'Confirmed', amount: '₹500' },
];

const revenueData = [
  { day: 'Mon', revenue: 5200 },
  { day: 'Tue', revenue: 6800 },
  { day: 'Wed', revenue: 7200 },
  { day: 'Thu', revenue: 6400 },
  { day: 'Fri', revenue: 8900 },
  { day: 'Sat', revenue: 12400 },
  { day: 'Sun', revenue: 11200 },
];

const bookingsData = [
  { day: 'Mon', bookings: 8 },
  { day: 'Tue', bookings: 12 },
  { day: 'Wed', bookings: 10 },
  { day: 'Thu', bookings: 14 },
  { day: 'Fri', bookings: 16 },
  { day: 'Sat', bookings: 22 },
  { day: 'Sun', bookings: 18 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-neutral-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Weekly Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's Bookings Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Today's Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {todayBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-neutral-900">
                      <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                      {booking.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {booking.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                    {booking.court}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {booking.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
