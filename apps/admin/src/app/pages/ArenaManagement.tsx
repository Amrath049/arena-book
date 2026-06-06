import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, FileText, MessageSquare, Save, Upload, X, Image } from 'lucide-react';
import { arenaService } from '@/services/arena.service';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'arenabookarenas');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.secure_url as string;
}

export function ArenaManagement() {
  const [arenaId, setArenaId] = useState('');
  const [form, setForm] = useState({
    name: '', address: '', city: '', phone: '', email: '',
    description: '', terms: '', customMsg: '',
    latitude: '', longitude: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingSlot = useRef<number>(0);
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    arenaService.getMyArena().then(res => {
      const a = res.data?.data || res.data;
      if (a?.id) {
        setArenaId(a.id);
        setForm({
          name: a.name ?? '',
          address: a.address ?? '',
          city: a.city ?? '',
          phone: a.phone ?? '',
          email: a.email ?? '',
          description: a.description ?? '',
          terms: a.terms ?? '',
          customMsg: a.customMsg ?? '',
          latitude: a.latitude?.toString() ?? '',
          longitude: a.longitude?.toString() ?? '',
        });
        setImages(a.images ?? []);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleImageSlotClick = (slotIndex: number) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to apps/admin/.env');
      return;
    }
    uploadingSlot.current = slotIndex;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Only JPG, PNG, WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be under 5 MB');
      return;
    }

    const slot = uploadingSlot.current;
    setUploading(slot);
    setMessage('');
    try {
      const url = await uploadToCloudinary(file);
      setImages(prev => {
        const updated = [...prev];
        updated[slot] = url;
        return updated;
      });
    } catch {
      setMessage('Image upload failed. Check your Cloudinary credentials.');
    } finally {
      setUploading(null);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === dropIndex) {
      setDragOver(null);
      return;
    }
    setImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOver(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload: any = {
        ...form,
        images: images.filter(Boolean),
      };
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      else delete payload.latitude;
      if (form.longitude) payload.longitude = parseFloat(form.longitude);
      else delete payload.longitude;
      delete payload.latitude_str;
      delete payload.longitude_str;

      if (arenaId) {
        await arenaService.updateArena(arenaId, payload);
        setMessage('Arena details saved successfully!');
      } else {
        const res = await arenaService.createArena(payload);
        setArenaId(res.data?.arena?.id || res.data?.data?.id || '');
        setMessage('Arena created successfully!');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to save arena details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-40 border border-neutral-200" />)}</div>;

  // Show 8 slots; fill with existing images, rest are empty
  const imageSlots = Array.from({ length: 8 }, (_, i) => images[i] ?? null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Arena Management</h2>
        <p className="text-neutral-600 mt-1">Manage your arena details and settings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Arena Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2"><Phone className="inline w-4 h-4 mr-1" />Phone *</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2"><Mail className="inline w-4 h-4 mr-1" />Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">City *</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2"><MapPin className="inline w-4 h-4 mr-1" />Address *</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)} rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Describe your arena..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 12.9716" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 77.5946" />
            </div>
          </div>
        </div>

        {/* Arena Images */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Arena Images
            </h3>
            <span className="text-xs text-neutral-500">{images.filter(Boolean).length}/8 uploaded</span>
          </div>

          {(!CLOUD_NAME || CLOUD_NAME === 'your_cloud_name') && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              ⚠️ Cloudinary not configured. Add <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> to <code className="bg-amber-100 px-1 rounded">apps/admin/.env</code> then restart the dev server.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imageSlots.map((url, i) => (
              <div
                key={i}
                className={`aspect-square relative transition-all duration-150 ${
                  dragOver === i && dragIndex.current !== null && dragIndex.current !== i
                    ? 'scale-105 ring-2 ring-blue-500 ring-offset-2 rounded-lg'
                    : ''
                }`}
                onDragOver={url ? (e) => handleDragOver(e, i) : undefined}
                onDrop={url ? (e) => handleDrop(e, i) : undefined}
              >
                {url ? (
                  <div
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragEnd={handleDragEnd}
                    className={`w-full h-full rounded-lg overflow-hidden border border-neutral-200 group relative cursor-grab active:cursor-grabbing ${
                      dragIndex.current === i ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Arena image ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                    {/* Position badge */}
                    <div className="absolute top-1 left-1 w-5 h-5 bg-black/50 text-white rounded text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {/* Drag hint */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Drag to reorder
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleImageSlotClick(i)}
                    disabled={uploading !== null}
                    className="w-full h-full rounded-lg border-2 border-dashed border-neutral-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading === i ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-blue-600">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-neutral-400" />
                        <span className="text-xs text-neutral-500">Upload Image</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            JPG, PNG, WEBP · max 5 MB · Recommended 1200×800px · <span className="text-blue-500">Drag images to reorder</span> · Click ✕ to remove
          </p>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            <FileText className="inline w-5 h-5 mr-2" />Terms & Conditions
          </h3>
          <textarea value={form.terms} onChange={e => set('terms', e.target.value)} rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Enter your terms and conditions..." />
        </div>

        {/* Custom Booking Message */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            <MessageSquare className="inline w-5 h-5 mr-2" />Custom Booking Message
          </h3>
          <textarea value={form.customMsg} onChange={e => set('customMsg', e.target.value)} rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Message shown to customers after booking..." />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-60">
            <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
