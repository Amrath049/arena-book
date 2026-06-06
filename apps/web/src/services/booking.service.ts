import api from '../lib/api';

export const bookingService = {
  createBooking: (data: {
    courtId: string;
    arenaId: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  }) => api.post('/bookings', data),

  getMyBookings: (page = 1, limit = 20) =>
    api.get('/bookings/player', { params: { page, limit } }),

  cancelBooking: (id: string, reason?: string) =>
    api.patch(`/bookings/${id}/cancel`, { reason }),
};
