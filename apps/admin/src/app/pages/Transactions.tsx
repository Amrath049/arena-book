import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { walletService } from '@/services/wallet.service';

interface WithdrawForm {
  amount: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'SAVINGS' | 'CURRENT';
}

export function Transactions() {
  const [wallet, setWallet] = useState<{ walletBalance: number; holdAmount: number; holdBookingsCount: number }>({ walletBalance: 0, holdAmount: 0, holdBookingsCount: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [form, setForm] = useState<WithdrawForm>({ amount: '', accountHolderName: '', accountNumber: '', ifscCode: '', accountType: 'SAVINGS' });
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    walletService.getAdminWallet().then(r => setWallet(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    walletService.getTransactions(page).then(r => {
      const d = r.data;
      setTransactions(d.transactions ?? []);
      setPages(d.pages ?? 1);
    }).catch(console.error).finally(() => setLoading(false));
  }, [page]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) { setWithdrawError('Invalid amount'); return; }
    if (amount > wallet.walletBalance) { setWithdrawError('Insufficient balance'); return; }
    setWithdrawing(true);
    try {
      await walletService.requestWithdrawal({
        amount,
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        accountType: form.accountType,
      });
      setShowWithdrawModal(false);
      setSuccessMsg('Withdrawal request submitted! Bank transfer will be processed within 2–3 business days.');
      const wr = await walletService.getAdminWallet();
      setWallet(wr.data);
      const tr = await walletService.getTransactions(1);
      setTransactions(tr.data.transactions ?? []);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setWithdrawError(err.response?.data?.message || 'Failed to submit withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Transactions</h2>
        <p className="text-neutral-600 mt-1">Your wallet and transaction history</p>
      </div>

      {successMsg && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{successMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 opacity-80" />
                <p className="text-blue-100 text-sm">Available Balance</p>
              </div>
              <p className="text-4xl font-bold">₹{wallet.walletBalance.toLocaleString('en-IN')}</p>
              <p className="text-blue-200 text-xs mt-1">Ready to withdraw</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" /> Withdraw
            </button>
          </div>
        </div>

        {/* Hold Amount */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 opacity-80" />
                <p className="text-amber-100 text-sm">Hold Amount</p>
              </div>
              <p className="text-4xl font-bold">₹{wallet.holdAmount.toLocaleString('en-IN')}</p>
              <p className="text-amber-200 text-xs mt-1">
                {wallet.holdBookingsCount} confirmed booking{wallet.holdBookingsCount !== 1 ? 's' : ''} · released after slot completion
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                {['Date', 'Description', 'Type', 'Amount'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-neutral-500">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-neutral-500">No transactions yet</td></tr>
              ) : transactions.map(t => (
                <tr key={t.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-600 whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{t.reason || t.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold whitespace-nowrap ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-40"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-40"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-neutral-500 hover:text-neutral-700"><X className="w-5 h-5" /></button>
            </div>

            {/* Informational note */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 leading-relaxed">
              ℹ️ This submits a <strong>withdrawal request</strong>. The platform will process the bank transfer manually within 2–3 business days. Your in-app balance will be deducted immediately.
            </div>

            <p className="text-sm text-neutral-500 mb-4">Available: <span className="font-semibold text-neutral-800">₹{wallet.walletBalance.toLocaleString('en-IN')}</span></p>

            {withdrawError && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{withdrawError}</div>}

            <form onSubmit={handleWithdraw} className="space-y-4">
              {[
                { label: 'Amount (₹)', key: 'amount', type: 'number', placeholder: 'Enter amount' },
                { label: 'Account Holder Name', key: 'accountHolderName', type: 'text', placeholder: 'Full name' },
                { label: 'Account Number', key: 'accountNumber', type: 'text', placeholder: '9-18 digit account number' },
                { label: 'IFSC Code', key: 'ifscCode', type: 'text', placeholder: 'e.g. SBIN0001234' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Account Type</label>
                <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="SAVINGS">Savings</option>
                  <option value="CURRENT">Current</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50">Cancel</button>
                <button type="submit" disabled={withdrawing}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">
                  {withdrawing ? 'Processing...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
