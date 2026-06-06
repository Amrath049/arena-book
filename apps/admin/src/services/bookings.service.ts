import api from '../lib/api';

export const bookingsService = {
  getArenaBookings: (arenaId: string, page = 1, limit = 20, status?: string) =>
    api.get(`/bookings/arena/${arenaId}`, { params: { page, limit, status } }),

  adminCreateBooking: (data: {
    playerId: string;
    courtId: string;
    arenaId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  }) => api.post('/bookings/admin', data),

  cancelBooking: (id: string, reason?: string) => api.patch(`/bookings/${id}/cancel`, { reason }),
  completeBooking: (id: string) => api.patch(`/bookings/${id}/complete`),
};
