import api from '../lib/api';

export const settingsService = {
  getSettings: (arenaId: string) => api.get('/settings', { params: { arenaId } }),
  saveSettings: (data: {
    arenaId: string;
    bookingCloseMins: number;
    cancellationRules: { hoursBeforeSlot: number; refundPercent: number }[];
  }) => api.put('/settings', data),
};
