import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useLang } from '../context/LanguageContext';
import { transport } from '../api';
import { warehouses, maharashtraDistricts } from '../data';
import { Truck, MapPin, ArrowRight, Warehouse as WarehouseIcon, IndianRupee } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function TransportPage() {
  const { t } = useLang();
  const [bookings, setBookings] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [bookingType, setBookingType] = useState('farmer_to_warehouse');
  const [form, setForm] = useState({ pickup_location: '', delivery_location: '', vehicle_type: 'truck', crop_id: '', warehouse_id: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try { const { data } = await transport.list(); setBookings(data); } catch (err) { console.error(err); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transport.book({ ...form, crop_id: parseInt(form.crop_id) });
      setShowBook(false);
      setForm({ pickup_location: '', delivery_location: '', vehicle_type: 'truck', crop_id: '', warehouse_id: '' });
      loadBookings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    try { await transport.updateStatus(id, status); loadBookings(); } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const statusColor = (s) => ({ requested: 'bg-yellow-100 text-yellow-700', accepted: 'bg-blue-100 text-blue-700', in_transit: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700' }[s] || 'bg-gray-100 text-gray-700');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t.transport.title}</h1>
          <button onClick={() => setShowBook(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"><Truck className="w-4 h-4" /> {t.transport.book}</button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Hub & Spoke AI Logistics</h3>
          <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center">
              <p className="font-bold">Farmer</p>
              <p className="text-xs">Crops</p>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-center">
              <p className="font-bold">APMC Warehouse</p>
              <p className="text-xs">Quality Check + Storage</p>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-center">
              <p className="font-bold">Buyer</p>
              <p className="text-xs">Retail / Distribution</p>
            </div>
          </div>
        </div>

        {showBook && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">{t.transport.book}</h3>
            <div className="flex gap-3 mb-4">
              <button onClick={() => setBookingType('farmer_to_warehouse')} className={`px-4 py-2 rounded-lg text-sm font-medium ${bookingType === 'farmer_to_warehouse' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>🌾 {t.transport.farmerToWarehouse}</button>
              <button onClick={() => setBookingType('warehouse_to_buyer')} className={`px-4 py-2 rounded-lg text-sm font-medium ${bookingType === 'warehouse_to_buyer' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>🏪 {t.transport.warehouseToBuyer}</button>
            </div>
            <form onSubmit={handleBook} className="grid md:grid-cols-2 gap-4">
              <input placeholder={t.transport.pickup} required value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} className="px-4 py-2 border rounded-lg" />
              <input placeholder={t.transport.delivery} required value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })} className="px-4 py-2 border rounded-lg" />
              <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })} className="px-4 py-2 border rounded-lg">
                <option value="truck">Truck</option><option value="tempo">Tempo</option><option value="trailer">Refrigerated Truck</option>
              </select>
              <input type="number" min="0" placeholder="Crop ID" required value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: Math.max(0, parseInt(e.target.value) || 0) })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="px-4 py-2 border rounded-lg" />
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600 mb-2 block">Select Nearest APMC Warehouse</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {warehouses.map((wh) => (
                    <button key={wh.id} type="button" onClick={() => setForm({ ...form, warehouse_id: wh.id, delivery_location: wh.location })} className={`p-3 rounded-lg border-2 text-left text-xs ${form.warehouse_id === wh.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="font-bold">{wh.name}</p>
                      <p className="text-gray-500">{wh.location} | {(wh.capacity / 1000).toFixed(0)}K kg</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">{loading ? '...' : t.transport.bookBtn}</button>
                <button type="button" onClick={() => setShowBook(false)} className="px-6 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <motion.div key={b.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">Booking #{b.id}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.pickup_location} → {b.delivery_location}</p>
                <p>Vehicle: {b.vehicle_type}</p>
                {b.estimated_cost && <p className="flex items-center gap-1 font-bold text-green-700"><IndianRupee className="w-3 h-3" /> {b.estimated_cost}</p>}
              </div>
              <div className="mt-3 flex gap-2">
                {b.status === 'requested' && <button onClick={() => handleStatus(b.id, 'accepted')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">{t.transport.accept}</button>}
                {b.status === 'accepted' && <button onClick={() => handleStatus(b.id, 'in_transit')} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">{t.transport.startTransit}</button>}
                {b.status === 'in_transit' && <button onClick={() => handleStatus(b.id, 'delivered')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">{t.transport.delivered}</button>}
              </div>
            </motion.div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500 text-center py-10 col-span-2">No bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
