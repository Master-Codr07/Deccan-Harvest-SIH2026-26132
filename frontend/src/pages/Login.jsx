import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Sprout, Globe, AlertTriangle } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const { login } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      setShowExpired(true);
      setTimeout(() => setShowExpired(false), 5000);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const r = user.role;
      navigate(r === 'farmer' ? '/farmer' : r === 'dealer' ? '/dealer' : r === 'apmc_officer' ? '/officer' : r === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Deccan Harvest</span>
          </div>
          <button onClick={toggleLang} className="flex items-center gap-1 text-sm px-2 py-1 border rounded-lg"><Globe className="w-3 h-3" /> {lang === 'en' ? 'मराठी' : 'EN'}</button>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">{t.auth.login}</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Smart India Hackathon 2026</p>

        <AnimatePresence>
          {showExpired && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Session expired. Please log in again.
            </motion.div>
          )}
        </AnimatePresence>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input type="email" placeholder={t.auth.email} required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
          <input type="password" placeholder={t.auth.password} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg disabled:opacity-50 transition-all">{loading ? '...' : t.auth.login}</button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">{t.auth.noAccount} <Link to="/register" className="text-green-600 hover:underline font-medium">{t.auth.register}</Link></p>
      </motion.div>
    </div>
  );
}
