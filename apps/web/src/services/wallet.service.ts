import api from '../lib/api';

export const walletService = {
  getWallet: () => api.get('/wallet/player'),
  getTransactions: (page = 1, limit = 20) =>
    api.get('/wallet/transactions', { params: { page, limit } }),
  initiateRecharge: (amount: number) =>
    api.post('/wallet/recharge/initiate', { amount }),
  verifyRecharge: (orderId: string) =>
    api.post('/wallet/recharge/verify', { orderId }),
};
