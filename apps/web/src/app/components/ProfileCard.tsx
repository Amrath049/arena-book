import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, Save, X, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { playerService } from '@/services/player.service';
import { useAuth } from '@/contexts/AuthContext';

export function ProfileCard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', createdAt: '' });
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    playerService.getProfile().then(r => {
      const p = r.data;
      setProfile({
        name: p.name ?? '',
        email: p.email ?? '',
        phone: p.phone ?? '',
        createdAt: p.createdAt ?? '',
      });
      setEditData({ name: p.name ?? '', phone: p.phone ?? '' });
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const r = await playerService.updateProfile(editData);
      const p = r.data;
      setProfile(prev => ({ ...prev, name: p.name ?? '', phone: p.phone ?? '' }));
      setIsEditing(false);
      // Trigger a reload to refresh greeting
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="md:min-h-[360px] md:flex md:flex-col md:justify-between space-y-6">
      <div className="space-y-6 w-full">
        <div className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 mt-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-600" />
          Profile Details
        </h3>
        {!isEditing && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
              <Edit2 className="h-4 w-4" />Edit
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-2 cursor-pointer shadow-sm">
              <LogOut className="h-4 w-4" />Log Out
            </Button>
          </div>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="space-y-1">
          <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
          {isEditing ? (
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="pl-10 focus-visible:ring-emerald-500 bg-white" placeholder="Your full name" />
            </div>
          ) : (
            <p className="text-slate-800 font-semibold text-base mt-1 flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              {profile.name || '—'}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
          <p className="text-slate-700 font-semibold text-base mt-1 flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            {profile.email}
          </p>
        </div>

        <div className="space-y-1">
          <Label className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Phone Number</Label>
          {isEditing ? (
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={editData.phone}
                onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setEditData({ ...editData, phone: v }); }}
                className="pl-10 focus-visible:ring-emerald-500 bg-white" placeholder="10-digit mobile number" maxLength={10} />
            </div>
          ) : (
            <p className="text-slate-800 font-semibold text-base mt-1 flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              {profile.phone ? `+91 ${profile.phone}` : '—'}
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 pt-4 border-t border-slate-100 max-w-xs">
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer font-semibold shadow-md shadow-emerald-600/10">
            <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={() => { setIsEditing(false); setError(''); }} variant="outline" className="flex-1 gap-2 border-slate-200 text-slate-600 cursor-pointer font-semibold">
            <X className="h-4 w-4" />Cancel
          </Button>
        </div>
      )}
      </div>

      {/* Blended Footer Section */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Member since:</span>
          <span className="text-slate-600 font-semibold">
            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—'}
          </span>
        </div>
        <div className="flex items-center gap-4 font-semibold text-slate-500">
          <span className="hover:text-emerald-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span>&middot;</span>
          <span className="hover:text-emerald-600 cursor-pointer transition-colors">Terms of Service</span>
          <span>&middot;</span>
          <span className="hover:text-emerald-600 cursor-pointer transition-colors">Support Helpline</span>
        </div>
      </div>
    </div>
  );
}
