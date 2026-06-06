import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, Clock, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardService } from '@/services/dashboard.service';
import { arenaService } from '@/services/arena.service';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [arenaId, setArenaId] = useState<string>('');

  useEffect(() => {
    arenaService.getMyArena().then(res => {
      const id = res.data?.data?.id || res.data?.id;
      if (id) {
        setArenaId(id);
        return dashboardService.getStats(id);
      }
    }).then(res => {
      if (res) setStats(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3" />
              <div className="h-7 bg-neutral-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-neutral-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { name: "Today's Bookings", value: stats?.todayBookings?.count ?? 0, sub: `₹${stats?.todayBookings?.revenue ?? 0} revenue`, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { name: 'Upcoming Bookings', value: stats?.upcomingCount ?? 0, sub: 'Confirmed slots', icon: Clock, color: 'bg-purple-50 text-purple-600' },
    { name: 'Monthly Revenue', value: `₹${stats?.monthlyRevenue ?? 0}`, sub: `${stats?.monthlyBookingCount ?? 0} bookings`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
    { name: 'Wallet Balance', value: `₹${stats?.walletBalance ?? 0}`, sub: 'Available for withdrawal', icon: Wallet, color: 'bg-green-50 text-green-600' },
  ];

  const revenueData = stats?.weeklyRevenue ?? [];
  const bookingsData = stats?.weeklyRevenue?.map((d: any) => ({ ...d })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-neutral-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Weekly Bookings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Today's Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                {['Time', 'Customer', 'Court', 'Status', 'Amount'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(stats?.todayBookings?.bookings ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-neutral-500">No bookings today</td></tr>
              ) : (
                (stats?.todayBookings?.bookings ?? []).map((b: any) => (
                  <tr key={b.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-neutral-400" />{b.slot?.startTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{b.player?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{b.court?.gameType?.name} - {b.court?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">{b.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">₹{b.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
