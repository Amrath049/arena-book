import api from '../lib/api';

export const slotService = {
  getAvailableSlots: (courtId: string, date: string) =>
    api.get('/slots/available', { params: { courtId, date } }),
};
