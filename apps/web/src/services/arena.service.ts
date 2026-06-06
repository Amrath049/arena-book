import api from '../lib/api';

export const arenaService = {
  listArenas: (params?: { city?: string; sport?: string; page?: number; limit?: number }) =>
    api.get('/arena/public', { params }),
  getArenaDetail: (id: string) => api.get(`/arena/public/${id}`),
};
