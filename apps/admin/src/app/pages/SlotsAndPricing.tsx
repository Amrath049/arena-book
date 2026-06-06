import { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronRight, Lock, Unlock, Trash2 } from 'lucide-react';
import { gamesService } from '@/services/games.service';
import { slotsService } from '@/services/slots.service';
import { arenaService } from '@/services/arena.service';

const DAY_TYPES = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export function SlotsAndPricing() {
  const [arenaId, setArenaId] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [courts, setCourts] = useState<any[]>([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ dayType: 'MONDAY', price: '' });
  const [addingGroup, setAddingGroup] = useState(false);

  const [showDefModal, setShowDefModal] = useState<string | null>(null); // groupId
  const [newDef, setNewDef] = useState({ startTime: '06:00', endTime: '07:00', price: '' });
  const [addingDef, setAddingDef] = useState(false);

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

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

  useEffect(() => {
    if (!selectedGame) { setCourts([]); setSelectedCourt(''); return; }
    gamesService.getCourtsByGame(selectedGame).then(r => {
      const c = r.data?.courts ?? [];
      setCourts(c);
      if (c.length > 0) setSelectedCourt(c[0].id);
    }).catch(console.error);
  }, [selectedGame]);

  useEffect(() => {
    if (!selectedCourt) { setGroups([]); return; }
    slotsService.getSlotsByCourt(selectedCourt).then(r => setGroups(r.data ?? [])).catch(console.error);
  }, [selectedCourt]);

  const refreshGroups = () => {
    if (selectedCourt) slotsService.getSlotsByCourt(selectedCourt).then(r => setGroups(r.data ?? []));
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingGroup(true);
    try {
      await slotsService.createGroup({ courtId: selectedCourt, dayType: newGroup.dayType, price: newGroup.price ? Number(newGroup.price) : undefined });
      setShowGroupModal(false);
      setNewGroup({ dayType: 'MONDAY', price: '' });
      flash('Slot group created!');
      refreshGroups();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to create group');
    } finally {
      setAddingGroup(false);
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      await slotsService.deleteGroup(id);
      flash('Group deleted');
      refreshGroups();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const addDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDefModal) return;
    setAddingDef(true);
    try {
      await slotsService.addDefinition(showDefModal, { startTime: newDef.startTime, endTime: newDef.endTime, price: newDef.price ? Number(newDef.price) : undefined });
      setShowDefModal(null);
      setNewDef({ startTime: '06:00', endTime: '07:00', price: '' });
      flash('Slot time added!');
      refreshGroups();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setAddingDef(false);
    }
  };

  const deleteDefinition = async (id: string) => {
    try {
      await slotsService.deleteDefinition(id);
      flash('Slot deleted');
      refreshGroups();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2].map(i => <div key={i} className="bg-white rounded-xl h-32 border border-neutral-200" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Slots & Pricing</h2>
        <p className="text-neutral-600 mt-1">Define slot schedules and pricing for each court</p>
      </div>

      {message && <div className={`p-3 rounded-lg text-sm ${message.includes('!') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{message}</div>}

      <div className="bg-white rounded-xl p-4 border border-neutral-200 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">Sport</label>
          <select value={selectedGame} onChange={e => setSelectedGame(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">Select sport...</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-neutral-600 mb-1">Court</label>
          <select value={selectedCourt} onChange={e => setSelectedCourt(e.target.value)}
            disabled={!selectedGame || courts.length === 0}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
            <option value="">Select court...</option>
            {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {selectedCourt && (
          <div className="flex items-end">
            <button onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Day Schedule
            </button>
          </div>
        )}
      </div>

      {!selectedCourt ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <p className="text-neutral-500">Select a sport and court to manage slots</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-neutral-200 text-center">
          <p className="text-neutral-500">No slot schedules yet. Add a day schedule above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50" onClick={() => toggleExpand(group.id)}>
                <div className="flex items-center gap-3">
                  {expanded.has(group.id) ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                  <span className="font-semibold text-neutral-900">{group.dayType}</span>
                  {group.price && <span className="text-sm text-neutral-500">Default: ₹{group.price}</span>}
                  <span className="text-xs text-neutral-400">{group.slotDefs?.length ?? 0} slots</span>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowDefModal(group.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Slot
                  </button>
                  <button onClick={() => deleteGroup(group.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expanded.has(group.id) && (
                <div className="border-t border-neutral-200 divide-y divide-neutral-100">
                  {(!group.slotDefs || group.slotDefs.length === 0) ? (
                    <p className="px-6 py-4 text-sm text-neutral-500">No slots. Add slots above.</p>
                  ) : group.slotDefs.map((def: any) => (
                    <div key={def.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-neutral-900">{def.startTime} – {def.endTime}</span>
                        {def.price && <span className="text-sm text-neutral-600">₹{def.price}</span>}
                      </div>
                      <button onClick={() => deleteDefinition(def.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Day Schedule</h3>
              <button onClick={() => setShowGroupModal(false)}><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <form onSubmit={addGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Day Type</label>
                <select value={newGroup.dayType} onChange={e => setNewGroup({ ...newGroup, dayType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  {DAY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Default Price (₹) — optional</label>
                <input type="number" value={newGroup.price} onChange={e => setNewGroup({ ...newGroup, price: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowGroupModal(false)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancel</button>
                <button type="submit" disabled={addingGroup} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">
                  {addingGroup ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDefModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Slot Time</h3>
              <button onClick={() => setShowDefModal(null)}><X className="w-5 h-5 text-neutral-500" /></button>
            </div>
            <form onSubmit={addDefinition} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Start Time</label>
                  <input type="time" value={newDef.startTime} onChange={e => setNewDef({ ...newDef, startTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">End Time</label>
                  <input type="time" value={newDef.endTime} onChange={e => setNewDef({ ...newDef, endTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price (₹) — override group default</label>
                <input type="number" value={newDef.price} onChange={e => setNewDef({ ...newDef, price: e.target.value })}
                  placeholder="e.g. 600"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDefModal(null)} className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancel</button>
                <button type="submit" disabled={addingDef} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">
                  {addingDef ? 'Adding...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
