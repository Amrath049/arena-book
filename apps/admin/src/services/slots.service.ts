import api from '../lib/api';

export const slotsService = {
  getSlotsByCourt: (courtId: string) => api.get(`/slots/court/${courtId}`),
  getAvailableSlots: (courtId: string, date: string) => api.get('/slots/available', { params: { courtId, date } }),

  createGroup: (data: { courtId: string; dayType: string; price?: number }) => api.post('/slots/groups', data),
  updateGroup: (id: string, data: any) => api.put(`/slots/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/slots/groups/${id}`),

  addDefinition: (groupId: string, data: { startTime: string; endTime: string; price?: number }) =>
    api.post(`/slots/groups/${groupId}/definitions`, data),
  updateDefinition: (id: string, data: any) => api.put(`/slots/definitions/${id}`, data),
  deleteDefinition: (id: string) => api.delete(`/slots/definitions/${id}`),

  blockSlot: (data: { courtId: string; date: string; startTime: string; endTime: string; price: number }) =>
    api.post('/slots/block', data),
  unblockSlot: (data: { courtId: string; date: string; startTime: string; endTime: string; price: number }) =>
    api.post('/slots/unblock', data),
};
