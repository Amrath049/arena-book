import { useState } from 'react';
import { Plus, Edit2, Trash2, Gamepad2 } from 'lucide-react';

interface Court {
  id: number;
  name: string;
  slotDuration: number;
}

interface Game {
  id: number;
  name: string;
  courts: Court[];
}

const mockGames: Game[] = [
  {
    id: 1,
    name: 'Badminton',
    courts: [
      { id: 1, name: 'Court 1', slotDuration: 60 },
      { id: 2, name: 'Court 2', slotDuration: 60 },
      { id: 3, name: 'Court 3', slotDuration: 60 },
    ],
  },
  {
    id: 2,
    name: 'Cricket (Nets)',
    courts: [
      { id: 4, name: 'Net 1', slotDuration: 60 },
      { id: 5, name: 'Net 2', slotDuration: 60 },
    ],
  },
  {
    id: 3,
    name: 'Football',
    courts: [
      { id: 6, name: 'Field 1', slotDuration: 90 },
    ],
  },
];

export function GamesManagement() {
  const [games, setGames] = useState<Game[]>(mockGames);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleAddCourt = (gameId: number) => {
    setSelectedGame(games.find(g => g.id === gameId) || null);
    setShowCourtModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Games & Courts</h2>
          <p className="text-neutral-600 mt-1">Manage games and their courts</p>
        </div>
        <button
          onClick={() => setShowGameModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Game
        </button>
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => (
          <div key={game.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Game Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Gamepad2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{game.name}</h3>
                    <p className="text-sm text-neutral-600">{game.courts.length} courts</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                    <Edit2 className="w-4 h-4 text-neutral-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Courts List */}
            <div className="p-6">
              <div className="space-y-3">
                {game.courts.map((court) => (
                  <div
                    key={court.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{court.name}</p>
                      <p className="text-sm text-neutral-600">
                        Slot Duration: {court.slotDuration} minutes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-white transition-colors">
                        <Edit2 className="w-4 h-4 text-neutral-600" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddCourt(game.id)}
                className="w-full mt-4 px-4 py-2.5 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-600 font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Court
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Game Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">Add New Game</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Game Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Badminton, Cricket"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGameModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowGameModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Court Modal */}
      {showCourtModal && selectedGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Add Court to {selectedGame.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Court 1, Net 1"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Slot Duration (minutes) *
                </label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCourtModal(false);
                    setSelectedGame(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCourtModal(false);
                    setSelectedGame(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Court
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
