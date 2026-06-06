import api from '../lib/api';

export const gamesService = {
  getGamesByArena: (arenaId: string) => api.get(`/games/arena/${arenaId}`),
  createGame: (data: { name: string; arenaId: string }) => api.post('/games', data),
  updateGame: (id: string, data: any) => api.patch(`/games/${id}`, data),
  deleteGame: (id: string) => api.delete(`/games/${id}`),

  getCourtsByGame: (gameTypeId: string) => api.get(`/games/courts/game/${gameTypeId}`),
  createCourt: (data: { name: string; gameTypeId: string; slotDuration?: number }) => api.post('/games/courts', data),
  updateCourt: (id: string, data: any) => api.patch(`/games/courts/${id}`, data),
  deleteCourt: (id: string) => api.delete(`/games/courts/${id}`),
};
