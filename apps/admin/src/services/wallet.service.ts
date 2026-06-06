import api from '../lib/api';

export const walletService = {
  getAdminWallet: () => api.get('/wallet/admin'),
  getTransactions: (page = 1, limit = 20) =>
    api.get('/wallet/transactions', { params: { page, limit } }),
  requestWithdrawal: (data: {
    amount: number;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
  }) => api.post('/wallet/withdraw', data),
};
