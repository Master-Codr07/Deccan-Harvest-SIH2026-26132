import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { states, unionTerritories, maharashtraDistricts } from '../data';
import { Sprout, Globe, Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'farmer', location: '', state: 'Maharashtra', ration_card_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      const r = user.role;
      navigate(r === 'farmer' ? '/farmer' : r === 'dealer' ? '/dealer' : r === 'apmc_officer' ? '/officer' : r === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-green-800">Deccan Harvest</span>
          </Link>
          <button onClick={toggleLang} className="flex items-center gap-1 text-sm px-2 py-1 border rounded-lg"><Globe className="w-3 h-3" /> {lang === 'en' ? 'मराठी' : 'EN'}</button>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">{t.auth.register}</h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder={t.auth.name} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
          <input type="email" placeholder={t.auth.email} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
          <input type="tel" placeholder={t.auth.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
          <input type="password" placeholder={t.auth.password} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, location: '' })} className="w-full px-4 py-2 border rounded-xl">
            <option value="farmer">{t.auth.farmer}</option>
            <option value="dealer">{t.auth.dealer}</option>
            <option value="apmc_officer">{t.auth.apmc_officer}</option>
          </select>

          {form.state === 'Maharashtra' ? (
            <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2 border rounded-xl">
              <option value="">Select District</option>
              {maharashtraDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input type="text" placeholder={t.auth.location} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2 border rounded-xl" />
          )}
          <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold disabled:opacity-50">{loading ? 'Creating...' : t.auth.register}</button>
        </form>
        <p className="text-center mt-4 text-gray-600 text-sm">{t.auth.haveAccount} <Link to="/login" className="text-green-600 hover:underline font-medium">{t.auth.login}</Link></p>
      </motion.div>
    </div>
  );
}
