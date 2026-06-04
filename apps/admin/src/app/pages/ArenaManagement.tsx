import { useState } from 'react';
import { Upload, MapPin, Phone, Mail, Clock, FileText, MessageSquare } from 'lucide-react';

export function ArenaManagement() {
  const [arenaData, setArenaData] = useState({
    name: 'Champions Sports Arena',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    phone: '+91 98765 43210',
    email: 'contact@championsarena.com',
    openTime: '06:00',
    closeTime: '22:00',
    terms: 'Please arrive 10 minutes before your booking time. Cancellation allowed up to 2 hours before booking.',
    bookingMessage: 'Thank you for booking with Champions Sports Arena! See you soon!',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Arena details saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Arena Management</h2>
          <p className="text-neutral-600 mt-1">Manage your arena details and settings</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Arena Name *
              </label>
              <input
                type="text"
                value={arenaData.name}
                onChange={(e) => setArenaData({ ...arenaData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={arenaData.phone}
                onChange={(e) => setArenaData({ ...arenaData, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Address *
              </label>
              <textarea
                value={arenaData.address}
                onChange={(e) => setArenaData({ ...arenaData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={arenaData.email}
                onChange={(e) => setArenaData({ ...arenaData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Opening Time
                </label>
                <input
                  type="time"
                  value={arenaData.openTime}
                  onChange={(e) => setArenaData({ ...arenaData, openTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Closing Time
                </label>
                <input
                  type="time"
                  value={arenaData.closeTime}
                  onChange={(e) => setArenaData({ ...arenaData, closeTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Arena Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-neutral-300 hover:border-blue-500 flex items-center justify-center cursor-pointer group transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-neutral-400 group-hover:text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Upload Image</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-3">
            Upload up to 8 images. Recommended size: 1200x800px
          </p>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            <FileText className="inline w-5 h-5 mr-2" />
            Terms & Conditions
          </h3>
          <textarea
            value={arenaData.terms}
            onChange={(e) => setArenaData({ ...arenaData, terms: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Enter your terms and conditions..."
          />
        </div>

        {/* Custom Booking Message */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            <MessageSquare className="inline w-5 h-5 mr-2" />
            Custom Booking Message
          </h3>
          <textarea
            value={arenaData.bookingMessage}
            onChange={(e) => setArenaData({ ...arenaData, bookingMessage: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="This message will be shown to customers after booking..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
