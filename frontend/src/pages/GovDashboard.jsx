import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LanguageContext';
import { dashboard, ml } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Package, Gavel, MapPin, Brain } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function GovDashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [activity, setActivity] = useState(null);
  const [cropInput, setCropInput] = useState({ soil_ph: 7, rainfall: 200, humidity: 80, temperature: 25 });
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, f, a] = await Promise.all([dashboard.stats(), dashboard.supplyForecast(), dashboard.recentActivity()]);
      setStats(s.data); setForecast(f.data); setActivity(a.data);
    } catch (err) { console.error(err); }
  };

  const handleRecommend = async () => {
    try { const { data } = await ml.recommendCrop(cropInput); setRecommendation(data.recommended_crop); } catch (err) { alert('ML error'); }
  };

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{t.gov.title}</h1>

        {stats && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[[stats.total_farmers, t.dashboard.farmers, Users, 'bg-green-50'], [stats.total_dealers, t.dashboard.dealers, Package, 'bg-blue-50'], [stats.total_crops, t.dashboard.crops, Gavel, 'bg-purple-50'], [stats.total_auctions, t.dashboard.auctions, TrendingUp, 'bg-yellow-50'], [stats.crops_pending + stats.crops_verified, 'Total Listings', MapPin, 'bg-red-50']].map(([val, label, Icon, bg]) => (
              <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
                <Icon className="w-8 h-8 opacity-40" />
                <div><p className="text-2xl font-bold">{val}</p><p className="text-xs text-gray-600">{label}</p></div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {forecast && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-lg mb-4">📊 {t.dashboard.supplyForecast}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={forecast.crop_supply}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="crop" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_quantity" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
          {forecast && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-lg mb-4">📈 Auction Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={Object.entries(forecast.auction_stats).map(([k, v]) => ({ name: k, value: v }))} cx="50%" cy="50%" outerRadius={80} label>
                    {Object.entries(forecast.auction_stats).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600" /> {t.gov.cropRecommendation}</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-sm text-gray-600">Soil pH</label><input type="number" step="0.1" value={cropInput.soil_ph} onChange={(e) => setCropInput({ ...cropInput, soil_ph: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm text-gray-600">Rainfall (mm)</label><input type="number" value={cropInput.rainfall} onChange={(e) => setCropInput({ ...cropInput, rainfall: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm text-gray-600">Humidity (%)</label><input type="number" value={cropInput.humidity} onChange={(e) => setCropInput({ ...cropInput, humidity: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="text-sm text-gray-600">Temperature (C)</label><input type="number" value={cropInput.temperature} onChange={(e) => setCropInput({ ...cropInput, temperature: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" /></div>
            </div>
            <button onClick={handleRecommend} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> {t.gov.getRecommendation}</button>
            {recommendation && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <p className="text-sm text-green-600">{t.gov.recommended}</p>
                <p className="text-2xl font-bold text-green-800">{recommendation}</p>
              </motion.div>
            )}
          </motion.div>

          {activity && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-lg mb-4">📋 {t.dashboard.recentActivity}</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activity.recent_crops.map((c) => (
                  <div key={c.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span>{c.crop_name} (#{c.id})</span>
                    <span className={`px-2 py-1 rounded text-xs ${c.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                  </div>
                ))}
                {activity.recent_auctions.map((a) => (
                  <div key={a.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <span>Auction #{a.id} - ₹{a.highest_bid}</span>
                    <span className={`px-2 py-1 rounded text-xs ${a.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
