import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Check, X } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const quickAmounts = [1000, 2000, 5000, 10000];

function DepositModal({ onClose, depositAmount, setDepositAmount, onDeposit }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial="hidden" animate="visible" variants={fadeUp} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Deposit to DeccanWallet</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white mb-4">
          <p className="text-sm opacity-80">Current Balance</p>
          <p className="text-2xl font-bold">₹{useAuth().user?.wallet_balance?.toLocaleString()}</p>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-2">Quick Deposit</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickAmounts.map((amt) => {
            const isActive = depositAmount === amt.toString();
            return (
              <button key={amt} onClick={() => setDepositAmount(amt.toString())} className={`p-3 rounded-xl border-2 text-center transition-all ${isActive ? 'border-green-500 bg-green-100 text-green-900 font-bold' : 'border-gray-200 hover:border-green-300 text-gray-800 font-semibold'}`}>
                ₹{amt.toLocaleString()}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mb-3">
          <input type="number" min="0" placeholder="Custom amount" value={depositAmount} onChange={(e) => { const v = Math.max(0, parseFloat(e.target.value) || 0); setDepositAmount(v.toString()); }} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="flex-1 px-4 py-3 border rounded-xl text-lg" />
        </div>
        <button onClick={onDeposit} disabled={!depositAmount || parseFloat(depositAmount) <= 0} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
          <Check className="w-5 h-5" /> Deposit ₹{parseFloat(depositAmount) > 0 ? parseFloat(depositAmount).toLocaleString() : '0'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">1-Tap Payment • Mock • No real charges</p>
      </motion.div>
    </motion.div>
  );
}

export default function DeccanWallet({ compact = false }) {
  const { user, updateWallet } = useAuth();
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'deposit', amount: 5000, desc: 'Welcome Bonus', time: 'Just now' },
  ]);

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;
    updateWallet(amt);
    setTransactions([{ id: Date.now(), type: 'deposit', amount: amt, desc: 'Wallet Top-up', time: 'Now' }, ...transactions]);
    setDepositAmount('');
    setShowDeposit(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl">
        <Wallet className="w-4 h-4" />
        <span className="font-bold text-sm">₹{user?.wallet_balance?.toLocaleString() || 0}</span>
        <button onClick={() => setShowDeposit(true)} className="bg-white/20 hover:bg-white/30 p-1 rounded-lg transition-colors"><Plus className="w-3 h-3" /></button>
        <AnimatePresence>
          {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} depositAmount={depositAmount} setDepositAmount={setDepositAmount} onDeposit={handleDeposit} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl flex items-center gap-2"><Wallet className="w-5 h-5 text-green-600" /> DeccanWallet</h3>
        <button onClick={() => setShowDeposit(true)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Deposit</button>
      </div>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white mb-4">
        <p className="text-sm opacity-80">Available Balance</p>
        <motion.p key={user?.wallet_balance} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-4xl font-extrabold">₹{user?.wallet_balance?.toLocaleString() || 0}</motion.p>
        <p className="text-xs opacity-60 mt-1">Platform Fee: 5% on transactions</p>
      </div>
      <h4 className="font-bold text-sm text-gray-600 mb-3">Recent Transactions</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between text-sm border-b pb-2">
            <div className="flex items-center gap-2">
              {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
              <div><p className="font-medium">{tx.desc}</p><p className="text-xs text-gray-400">{tx.time}</p></div>
            </div>
            <span className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} depositAmount={depositAmount} setDepositAmount={setDepositAmount} onDeposit={handleDeposit} />}
      </AnimatePresence>
    </div>
  );
}
