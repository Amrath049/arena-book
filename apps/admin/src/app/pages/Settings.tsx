import { useState } from 'react';
import { Save, Clock, XCircle } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    cancellationHours: '2',
    refundPercentage: '100',
    bookingCloseMinutes: '30',
    autoConfirm: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Settings</h2>
        <p className="text-neutral-600 mt-1">Configure your arena settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cancellation Rules */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <XCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Cancellation Rules</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Cancellation Allowed Before (Hours) *
                </label>
                <input
                  type="number"
                  value={settings.cancellationHours}
                  onChange={(e) => setSettings({ ...settings, cancellationHours: e.target.value })}
                  min="0"
                  max="48"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Customers can cancel up to this many hours before booking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Refund Percentage (%) *
                </label>
                <input
                  type="number"
                  value={settings.refundPercentage}
                  onChange={(e) => setSettings({ ...settings, refundPercentage: e.target.value })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Amount to refund on eligible cancellations
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Cancellations made within {settings.cancellationHours} hours before the booking time will receive {settings.refundPercentage}% refund.
              </p>
            </div>
          </div>
        </div>

        {/* Booking Close Timing */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-neutral-900">Booking Close Timing</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Close Bookings Before (Minutes) *
            </label>
            <input
              type="number"
              value={settings.bookingCloseMinutes}
              onChange={(e) => setSettings({ ...settings, bookingCloseMinutes: e.target.value })}
              min="0"
              max="120"
              className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-neutral-500 mt-2">
              Stop accepting new bookings this many minutes before slot start time
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800">
                <strong>Example:</strong> If set to 30 minutes, a slot starting at 9:00 AM will close for booking at 8:30 AM.
              </p>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Notification Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Auto-confirm Bookings</p>
                <p className="text-sm text-neutral-600">Automatically confirm bookings upon payment</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoConfirm}
                  onChange={(e) => setSettings({ ...settings, autoConfirm: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">Email Notifications</p>
                <p className="text-sm text-neutral-600">Receive booking updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">SMS Notifications</p>
                <p className="text-sm text-neutral-600">Receive booking updates via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
          >
            Reset to Default
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
