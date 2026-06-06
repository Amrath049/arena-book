import { useState, useEffect } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';
import { gamesService } from '@/services/games.service';
import { arenaService } from '@/services/arena.service';

export function GamesManagement() {
  const [arenaId, setArenaId] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  // Add Game Modal
  const [showGameModal, setShowGameModal] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [addingGame, setAddingGame] = useState(false);

  // Add Court Modal
  const [showCourtModal, setShowCourtModal] = useState(false);
  const [courtForGame, setCourtForGame] = useState<string>('');
  const [newCourt, setNewCourt] = useState({ name: '', slotDuration: 60 });
  const [addingCourt, setAddingCourt] = useState(false);

  useEffect(() => {
    arenaService.getMyArena().then(r => {
      const id = r.data?.data?.id || r.data?.id;
      if (id) {
        setArenaId(id);
        return gamesService.getGamesByArena(id);
      }
    }).then(r => {
      if (r) setGames(r.data?.games ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    if (!arenaId) return;
    gamesService.getGamesByArena(arenaId).then(r => setGames(r.data?.games ?? [])).catch(console.error);
  };

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const addGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingGame(true);
    try {
      await gamesService.createGame({ name: newGameName, arenaId });
      setShowGameModal(false);
      setNewGameName('');
      flash('Game added!');
      refresh();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to add game');
    } finally {
      setAddingGame(false);
    }
  };

  const deleteGame = async (id: string) => {
    if (!confirm('Delete this game? All associated courts will be deactivated.')) return;
    try {
      await gamesService.deleteGame(id);
      flash('Game deleted');
      refresh();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to delete game');
    }
  };

  const addCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCourt(true);
    try {
      await gamesService.createCourt({ name: newCourt.name, gameTypeId: courtForGame, slotDuration: newCourt.slotDuration });
      setShowCourtModal(false);
      setNewCourt({ name: '', slotDuration: 60 });
      flash('Court added!');
      refresh();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to add court');
    } finally {
      setAddingCourt(false);
    }
  };

  const deleteCourt = async (id: string) => {
    try {
      await gamesService.deleteCourt(id);
      flash('Court deleted');
      refresh();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to delete court');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2].map(i => <div key={i} className="bg-white rounded-xl h-32 border border-neutral-200" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Games & Courts</h2>
          <p className="text-neutral-600 mt-1">Manage sports and their courts</p>
        </div>
        <button onClick={() => setShowGameModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Sport
        </button>
      </div>

      {message && <div className={`p-3 rounded-lg text-sm ${message.includes('!') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{message}</div>}

      {games.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <p className="text-neutral-500">No sports added yet. Add your first sport to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map(game => (
            <div key={game.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50" onClick={() => toggleExpand(game.id)}>
                <div className="flex items-center gap-3">
                  {expanded.has(game.id) ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                  <span className="font-semibold text-neutral-900">{game.name}</span>
                  <span className="text-sm text-neutral-500">{game.courts?.length ?? 0} courts</span>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setCourtForGame(game.id); setShowCourtModal(true); }}
                    className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50">
                    <Plus className="w-4 h-4" /> Add Court
                  </button>
                  <button onClick={() => deleteGame(game.id)} className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expanded.has(game.id) && (
                <div className="border-t border-neutral-200">
                  {(!game.courts || game.courts.length === 0) ? (
                    <p className="px-6 py-4 text-sm text-neutral-500">No courts yet. Add a court above.</p>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {game.courts.map((court: any) => (
                        <div key={court.id} className="flex items-center justify-between px-6 py-3">
                          <div>
                            <span className="text-sm font-medium text-neutral-900">{court.name}</span>
                            <span className="ml-2 text-xs text-neutral-500">Slot: {court.slotDuration} min</span>
                          </div>
                          <button onClick={() => deleteCourt(court.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showGameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Sport</h3>
              <button onClick={() => setShowGameModal(false)}><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <form onSubmit={addGame} className="space-y-4">
              <input type="text" value={newGameName} onChange={e => setNewGameName(e.target.value)}
                placeholder="Sport name (e.g. Badminton)"
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowGameModal(false)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancel</button>
                <button type="submit" disabled={addingGame} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">
                  {addingGame ? 'Adding...' : 'Add Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCourtModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Court</h3>
              <button onClick={() => setShowCourtModal(false)}><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <form onSubmit={addCourt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Court Name</label>
                <input type="text" value={newCourt.name} onChange={e => setNewCourt({ ...newCourt, name: e.target.value })}
                  placeholder="e.g. Court 1"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Slot Duration (minutes)</label>
                <input type="number" value={newCourt.slotDuration} onChange={e => setNewCourt({ ...newCourt, slotDuration: Number(e.target.value) })}
                  min={15}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCourtModal(false)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancel</button>
                <button type="submit" disabled={addingCourt} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">
                  {addingCourt ? 'Adding...' : 'Add Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
