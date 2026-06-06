import api from '../lib/api';

export const arenaService = {
  getMyArena: () => api.get('/arena'),
  updateArena: (id: string, data: any) => api.patch(`/arena/${id}`, data),
  createArena: (data: any) => api.post('/arena', data),
};
