import api from '../lib/api';

export const dashboardService = {
  getStats: (arenaId: string) => api.get('/dashboard/stats', { params: { arenaId } }),
};
