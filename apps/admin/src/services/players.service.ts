import api from '../lib/api';

export const playersService = {
  getPlayers: (search?: string, page = 1, limit = 20) =>
    api.get('/player/list', { params: { search, page, limit } }),
};
