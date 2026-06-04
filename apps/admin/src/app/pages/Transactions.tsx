import { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Calendar, Wallet, ArrowUpRight, X, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: number;
  date: string;
  type: 'credit' | 'debit' | 'withdrawal';
  description: string;
  amount: number;
  balance: number;
}

interface WithdrawForm {
  amount: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'savings' | 'current';
}

const WALLET_BALANCE = 15200;

const mockTransactions: Transaction[] = [
  { id: 1, date: '2026-01-17', type: 'credit', description: 'Booking Payment - BK001', amount: 500, balance: 15200 },
  { id: 2, date: '2026-01-17', type: 'credit', description: 'Booking Payment - BK002', amount: 800, balance: 14700 },
  { id: 3, date: '2026-01-17', type: 'debit', description: 'Electricity Bill Payment', amount: 2500, balance: 13900 },
  { id: 4, date: '2026-01-16', type: 'credit', description: 'Booking Payment - BK003', amount: 600, balance: 16400 },
  { id: 5, date: '2026-01-16', type: 'credit', description: 'Booking Payment - BK004', amount: 800, balance: 15800 },
  { id: 6, date: '2026-01-15', type: 'debit', description: 'Maintenance Charges', amount: 1500, balance: 15000 },
  { id: 7, date: '2026-01-15', type: 'credit', description: 'Booking Payment - BK005', amount: 1200, balance: 16500 },
];

const monthlyData = [
  { month: 'Aug', revenue: 45000, expenses: 12000 },
  { month: 'Sep', revenue: 52000, expenses: 11500 },
  { month: 'Oct', revenue: 48000, expenses: 13000 },
  { month: 'Nov', revenue: 65000, expenses: 12500 },
  { month: 'Dec', revenue: 78000, expenses: 15000 },
  { month: 'Jan', revenue: 85000, expenses: 14000 },
];

const emptyForm: WithdrawForm = {
  amount: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  accountType: 'savings',
};

export function Transactions() {
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [form, setForm] = useState<WithdrawForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<WithdrawForm>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalRevenue = monthlyData[monthlyData.length - 1].revenue;
  const totalExpenses = monthlyData[monthlyData.length - 1].expenses;
  const netProfit = totalRevenue - totalExpenses;

  function validate() {
    const errs: Partial<WithdrawForm> = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount';
    else if (amt > WALLET_BALANCE) errs.amount = 'Amount exceeds wallet balance';
    if (!form.accountHolderName.trim()) errs.accountHolderName = 'Required';
    if (!/^\d{9,18}$/.test(form.accountNumber)) errs.accountNumber = 'Enter a valid account number (9–18 digits)';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.toUpperCase())) errs.ifscCode = 'Enter a valid IFSC code (e.g. SBIN0001234)';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  }

  function handleClose() {
    setShowWithdrawModal(false);
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
  }

  function field(key: keyof WithdrawForm, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
        <input
          {...extra}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
            ${errors[key] ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
        />
        {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Transactions</h2>
          <p className="text-neutral-600 mt-1">Track revenue and expenses</p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-indigo-200">Wallet Balance</p>
            <p className="text-3xl font-bold mt-0.5">₹{WALLET_BALANCE.toLocaleString('en-IN')}</p>
            <p className="text-xs text-indigo-200 mt-1">Available for withdrawal</p>
          </div>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors self-start sm:self-auto"
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdraw Money
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-700">Total Revenue</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-700 mt-1">This month</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-700">Total Expenses</h3>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{totalExpenses.toLocaleString()}</p>
          <p className="text-sm text-red-700 mt-1">This month</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-700">Net Profit</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{netProfit.toLocaleString()}</p>
          <p className="text-sm text-blue-700 mt-1">+{((netProfit / totalRevenue) * 100).toFixed(1)}% margin</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
              <YAxis stroke="#999" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Recent Transactions</h3>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {mockTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-neutral-900">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                      {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      transaction.type === 'credit' ? 'bg-green-100 text-green-700' :
                      transaction.type === 'withdrawal' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-neutral-900">
                    ₹{transaction.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Withdraw Money</h3>
              </div>
              <button onClick={handleClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">Withdrawal Requested</h4>
                <p className="text-neutral-600 mt-2 text-sm">
                  ₹{parseFloat(form.amount).toLocaleString('en-IN')} will be credited to <span className="font-medium">{form.accountHolderName}</span>'s {form.accountType} account within 2–3 business days.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Available balance hint */}
                <div className="bg-indigo-50 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-indigo-700">Available balance</span>
                  <span className="text-sm font-semibold text-indigo-800">₹{WALLET_BALANCE.toLocaleString('en-IN')}</span>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={WALLET_BALANCE}
                    placeholder="Enter amount"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
                      ${errors.amount ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                  />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="As per bank records"
                    value={form.accountHolderName}
                    onChange={e => setForm(f => ({ ...f, accountHolderName: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
                      ${errors.accountHolderName ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                  />
                  {errors.accountHolderName && <p className="text-xs text-red-500 mt-1">{errors.accountHolderName}</p>}
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="Enter account number"
                    value={form.accountNumber}
                    onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
                      ${errors.accountNumber ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                  />
                  {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
                </div>

                {/* IFSC + Account Type row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={form.ifscCode}
                      onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value.toUpperCase() }))}
                      maxLength={11}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors
                        ${errors.ifscCode ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                    />
                    {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Account Type</label>
                    <select
                      value={form.accountType}
                      onChange={e => setForm(f => ({ ...f, accountType: e.target.value as 'savings' | 'current' }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Request Withdrawal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
