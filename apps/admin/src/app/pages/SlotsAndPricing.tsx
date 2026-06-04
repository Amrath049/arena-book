import { useState } from 'react';
import { Plus, Calendar, DollarSign, Clock, X } from 'lucide-react';

interface Slot {
  id: number;
  courtName: string;
  gameName: string;
  startTime: string;
  endTime: string;
  price: number;
  dayType: 'weekday' | 'weekend' | 'all';
  isBlocked: boolean;
}

const mockSlots: Slot[] = [
  { id: 1, courtName: 'Badminton Court 1', gameName: 'Badminton', startTime: '06:00', endTime: '07:00', price: 500, dayType: 'weekday', isBlocked: false },
  { id: 2, courtName: 'Badminton Court 1', gameName: 'Badminton', startTime: '07:00', endTime: '08:00', price: 600, dayType: 'weekday', isBlocked: false },
  { id: 3, courtName: 'Badminton Court 1', gameName: 'Badminton', startTime: '18:00', endTime: '19:00', price: 800, dayType: 'weekend', isBlocked: false },
  { id: 4, courtName: 'Cricket Net 1', gameName: 'Cricket', startTime: '06:00', endTime: '07:00', price: 800, dayType: 'all', isBlocked: false },
  { id: 5, courtName: 'Cricket Net 1', gameName: 'Cricket', startTime: '19:00', endTime: '20:00', price: 1000, dayType: 'weekend', isBlocked: true },
];

export function SlotsAndPricing() {
  const [slots, setSlots] = useState<Slot[]>(mockSlots);
  const [showModal, setShowModal] = useState(false);
  const [filterGame, setFilterGame] = useState<string>('all');

  const filteredSlots = filterGame === 'all' 
    ? slots 
    : slots.filter(slot => slot.gameName === filterGame);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Slots & Pricing</h2>
          <p className="text-neutral-600 mt-1">Manage slot timings and pricing</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Games</option>
            <option value="Badminton">Badminton</option>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Slot
          </button>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Game / Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Time Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Day Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{slot.courtName}</p>
                      <p className="text-sm text-neutral-600">{slot.gameName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-neutral-900">
                      <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      slot.dayType === 'weekend' 
                        ? 'bg-purple-100 text-purple-700' 
                        : slot.dayType === 'weekday'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {slot.dayType === 'all' ? 'All Days' : slot.dayType.charAt(0).toUpperCase() + slot.dayType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm font-medium text-neutral-900">
                      <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                      ₹{slot.price}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      slot.isBlocked 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {slot.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSlots(slots.map(s => 
                            s.id === slot.id ? { ...s, isBlocked: !s.isBlocked } : s
                          ));
                        }}
                        className="px-3 py-1.5 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors"
                      >
                        {slot.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 text-xs rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-neutral-900">Weekday Pricing</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹500-800</p>
          <p className="text-sm text-neutral-600 mt-1">Average per hour</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-neutral-900">Weekend Pricing</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹800-1,200</p>
          <p className="text-sm text-neutral-600 mt-1">Average per hour</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-neutral-900">Total Slots</h3>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{slots.length}</p>
          <p className="text-sm text-neutral-600 mt-1">Across all courts</p>
        </div>
      </div>

      {/* Create Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-900">Create New Slot</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Game *
                </label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Choose game</option>
                  <option value="badminton">Badminton</option>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Court *
                </label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Choose court</option>
                  <option value="1">Court 1</option>
                  <option value="2">Court 2</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Day Type *
                </label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="all">All Days</option>
                  <option value="weekday">Weekday</option>
                  <option value="weekend">Weekend</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
