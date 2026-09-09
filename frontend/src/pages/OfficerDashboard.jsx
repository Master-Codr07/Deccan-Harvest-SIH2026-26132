import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LanguageContext';
import { crops, auctions, dashboard } from '../api';
import { CheckCircle, XCircle, Play, Square, BarChart3, Gavel } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function OfficerDashboard() {
  const { t } = useLang();
  const [pendingCrops, setPendingCrops] = useState([]);
  const [verifiedCrops, setVerifiedCrops] = useState([]);
  const [auctionList, setAuctionList] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('verify');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pendRes, verRes, aucRes] = await Promise.all([
        crops.list({ status: 'pending_verification' }),
        crops.list({ status: 'verified' }),
        auctions.list(),
      ]);
      setPendingCrops(pendRes.data);
      setVerifiedCrops(verRes.data);
      setAuctionList(aucRes.data);
    } catch (err) { console.error(err); }
    try {
      const statRes = await dashboard.stats();
      setStats(statRes.data);
    } catch (err) { console.error('Stats unavailable:', err); }
  };

  const handleVerify = async (cropId, status) => {
    try { await crops.verify(cropId, status, status === 'verified' ? 'Quality approved' : 'Rejected'); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleStartAuction = async (cropId) => {
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      await auctions.create({ crop_id: cropId, scheduled_start: now.toISOString(), scheduled_end: end.toISOString(), slot_duration_minutes: 60 });
      loadData();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleEndAuction = async (id) => {
    try { await auctions.end(id); loadData(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">APMC Officer Dashboard</h1>

        {stats && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[[stats.total_farmers, 'Farmers', 'bg-green-50'], [stats.total_dealers, 'Dealers', 'bg-blue-50'], [stats.crops_pending, 'Pending', 'bg-yellow-50'], [stats.crops_verified, 'Verified', 'bg-purple-50']].map(([val, label, bg]) => (
              <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                <p className="text-3xl font-bold">{val}</p>
                <p className="text-sm text-gray-600">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex gap-3 mb-6">
          {[['verify', 'Verify Crops', CheckCircle], ['auctions', 'Manage Auctions', BarChart3]].map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${tab === key ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'verify' && (
          <div className="space-y-6">
            <h2 className="font-bold text-lg">Pending Verification ({pendingCrops.length})</h2>
            {pendingCrops.map((crop) => (
              <motion.div key={crop.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{crop.crop_name} <span className="text-gray-400 font-normal">#{crop.id}</span></h3>
                  <p className="text-sm text-gray-600">{crop.quantity} {crop.unit} | ₹{crop.base_price}/{crop.unit} | 📍{crop.location}</p>
                  <p className="text-sm text-gray-500">Farmer ID: {crop.farmer_id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleVerify(crop.id, 'verified')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {t.officer.approve}</button>
                  <button onClick={() => handleVerify(crop.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center gap-1"><XCircle className="w-4 h-4" /> {t.officer.reject}</button>
                </div>
              </motion.div>
            ))}
            {pendingCrops.length === 0 && <p className="text-gray-500 text-center py-10">All crops verified!</p>}

            <h2 className="font-bold text-lg mt-6">Verified - Start Auction ({verifiedCrops.length})</h2>
            {verifiedCrops.map((crop) => (
              <motion.div key={crop.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{crop.crop_name} <span className="text-gray-400">#{crop.id}</span></h3>
                  <p className="text-sm text-gray-600">{crop.quantity} {crop.unit} | ₹{crop.base_price}/{crop.unit}</p>
                </div>
                <button onClick={() => handleStartAuction(crop.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1">
                  <Gavel className="w-4 h-4" /> Start Auction
                </button>
              </motion.div>
            ))}
            {verifiedCrops.length === 0 && <p className="text-gray-500 text-center py-10">No verified crops waiting.</p>}
          </div>
        )}

        {tab === 'auctions' && (
          <div className="grid md:grid-cols-2 gap-4">
            {auctionList.map((a) => (
              <motion.div key={a.id} initial="hidden" animate="visible" variants={fadeUp} className={`bg-white rounded-xl shadow p-5 border-l-4 ${a.status === 'live' ? 'border-green-500' : 'border-gray-400'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">Auction #{a.id}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${a.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.status.toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Crop ID: {a.crop_id}</p>
                <p className="text-sm text-gray-600 mb-1">Highest Bid: <span className="font-bold text-green-700">₹{a.highest_bid}</span></p>
                <div className="flex gap-2 mt-2">
                  {a.status === 'live' && <button onClick={() => handleEndAuction(a.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Square className="w-3 h-3" /> {t.officer.end}</button>}
                  {a.status === 'ended' && <span className="text-sm text-gray-500">Auction ended</span>}
                </div>
              </motion.div>
            ))}
            {auctionList.length === 0 && <p className="text-gray-500 text-center py-10 col-span-2">No auctions yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
