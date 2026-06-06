import { useState, useEffect } from 'react';
import { Save, Clock, XCircle, Plus, Trash2 } from 'lucide-react';
import { settingsService } from '@/services/settings.service';
import { arenaService } from '@/services/arena.service';

interface CancellationRule { hoursBeforeSlot: number; refundPercent: number; }

export function Settings() {
  const [arenaId, setArenaId] = useState('');
  const [bookingCloseMins, setBookingCloseMins] = useState(30);
  const [rules, setRules] = useState<CancellationRule[]>([{ hoursBeforeSlot: 24, refundPercent: 100 }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    arenaService.getMyArena().then(async res => {
      const id = res.data?.data?.id || res.data?.id;
      if (!id) return;
      setArenaId(id);
      const s = await settingsService.getSettings(id);
      const data = s.data;
      setBookingCloseMins(data.bookingCloseMins ?? 30);
      setRules(data.cancellationRules?.length ? data.cancellationRules : [{ hoursBeforeSlot: 24, refundPercent: 100 }]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const addRule = () => setRules([...rules, { hoursBeforeSlot: 0, refundPercent: 0 }]);
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, field: keyof CancellationRule, value: number) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value };
    setRules(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arenaId) return;
    setSaving(true);
    try {
      await settingsService.saveSettings({ arenaId, bookingCloseMins, cancellationRules: rules });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2].map(i => <div key={i} className="bg-white rounded-xl h-40 border border-neutral-200" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Settings</h2>
        <p className="text-neutral-600 mt-1">Configure your arena settings</p>
      </div>

      {message && <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{message}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900">Cancellation Rules</h3>
            </div>
            <button type="button" onClick={addRule} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4" /> Add Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Hours Before Slot</label>
                  <input
                    type="number"
                    value={rule.hoursBeforeSlot}
                    onChange={(e) => updateRule(i, 'hoursBeforeSlot', Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Refund % (0–100)</label>
                  <input
                    type="number"
                    value={rule.refundPercent}
                    onChange={(e) => updateRule(i, 'refundPercent', Number(e.target.value))}
                    min={0} max={100}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <button type="button" onClick={() => removeRule(i)} className="p-2 text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Booking Close Timing</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Close Bookings Before (Minutes)</label>
            <input
              type="number"
              value={bookingCloseMins}
              onChange={(e) => setBookingCloseMins(Number(e.target.value))}
              min={0} max={120}
              className="w-full md:w-1/3 px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <p className="text-xs text-neutral-500 mt-2">Stop accepting bookings this many minutes before slot start time</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !arenaId}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
