import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { playerService } from '@/services/player.service';

export function ProfileCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    playerService.getProfile().then(r => {
      const p = r.data;
      setProfile({ name: p.name ?? '', email: p.email ?? '', phone: p.phone ?? '' });
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-green-600" />
          Player Profile
        </CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" />Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Full Name</Label>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="pl-10" placeholder="Your full name" />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-400" /><span className="text-gray-900">{profile.name || '—'}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Label>Email Address</Label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-400" /><span className="text-gray-900">{profile.email}</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Phone Number</Label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input value={editData.phone}
                  onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) setEditData({ ...editData, phone: v }); }}
                  className="pl-10" placeholder="10-digit mobile number" maxLength={10} />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-400" /><span className="text-gray-900">{profile.phone ? `+91 ${profile.phone}` : '—'}</span>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={() => { setIsEditing(false); setError(''); }} variant="outline" className="flex-1 gap-2">
                <X className="h-4 w-4" />Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
