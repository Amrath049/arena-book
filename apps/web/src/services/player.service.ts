import api from '../lib/api';

export const playerService = {
  getProfile: () => api.get('/player/profile'),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.patch('/player/profile', data),
  getFavourites: () => api.get('/player/arenas'),
  joinArena: (arenaId: string) => api.post(`/player/arenas/${arenaId}/join`),
  leaveArena: (arenaId: string) => api.delete(`/player/arenas/${arenaId}`),
};
