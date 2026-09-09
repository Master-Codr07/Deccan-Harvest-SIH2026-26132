import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { warehouse, crops as cropsApi } from '../api';
import { warehouses } from '../data';
import { Warehouse as WarehouseIcon, Plus, X, RefreshCw, Package, MapPin, Clock, CheckCircle, ArrowDown, ArrowUp } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const STATUS_MAP = {
  requested: { color: 'bg-yellow-100 text-yellow-700', label: 'Requested', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed', icon: CheckCircle },
  stored: { color: 'bg-green-100 text-green-700', label: 'Stored', icon: WarehouseIcon },
  released: { color: 'bg-purple-100 text-purple-700', label: 'Released', icon: ArrowUp },
};

export default function WarehousePage() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const isDealer = user?.role === 'dealer';
  const [bookings, setBookings] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myCrops, setMyCrops] = useState([]);
  const [form, setForm] = useState({
    warehouse_id: '',
    crop_id: '',
    capacity_used: '',
    cost_per_day: '',
  });

  useEffect(() => { loadBookings(); if (isFarmer) loadCrops(); }, []);

  const loadBookings = async () => {
    try { const { data } = await warehouse.list(); setBookings(data); } catch {}
    setLoading(false);
  };

  const loadCrops = async () => {
    try { const { data } = await cropsApi.list(); setMyCrops(data); } catch {}
  };

  const resetForm = () => setForm({ warehouse_id: '', crop_id: '', capacity_used: '', cost_per_day: '' });

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const wh = warehouses.find(w => w.id === parseInt(form.warehouse_id));
    try {
      const payload = {
        warehouse_name: wh?.name || '',
        location: wh?.location || '',
        capacity_used: parseFloat(form.capacity_used) || 100,
        cost_per_day: parseFloat(form.cost_per_day) || 50,
      };
      if (form.crop_id) payload.crop_id = parseInt(form.crop_id);
      await warehouse.book(payload);
      setShowBook(false);
      resetForm();
      loadBookings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to book warehouse'); }
    setSubmitting(false);
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'confirm') await warehouse.confirm(id);
      else if (action === 'store') await warehouse.store(id);
      else await warehouse.release(id);
      loadBookings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Warehouse Storage</h1>
            <p className="text-sm text-gray-500">
              {isFarmer ? 'Store your crops at an APMC warehouse' : isDealer ? 'Pick up your purchased produce' : 'Manage warehouse storage'}
            </p>
          </div>
          <button onClick={() => { setShowBook(true); resetForm(); }} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium">
            <Plus className="w-4 h-4" /> Book Storage
          </button>
        </div>

        {/* Available Warehouses */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-sm mb-3 text-gray-700">Available APMC Warehouses</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {warehouses.map(wh => (
              <div key={wh.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-bold text-xs">{wh.name}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {wh.location}</p>
                <p className="text-[10px] text-green-600 font-medium mt-0.5">{(wh.capacity / 1000).toFixed(0)}K kg capacity</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <AnimatePresence>
          {showBook && (
            <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg">
                  {isFarmer ? 'Store Your Crop' : 'Book Warehouse'}
                </h3>
                <button onClick={() => { setShowBook(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Warehouse</label>
                  <select required value={form.warehouse_id} onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white">
                    <option value="">Choose a warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.location}) - {(w.capacity / 1000).toFixed(0)}K kg</option>
                    ))}
                  </select>
                </div>

                {isFarmer && myCrops.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Select Crop to Store</label>
                    <select value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: e.target.value })} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white">
                      <option value="">Choose a crop (optional)</option>
                      {myCrops.map(c => (
                        <option key={c.id} value={c.id}>{c.crop_name} - {c.quantity} {c.unit} (ID: {c.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {isFarmer && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Capacity (kg)</label>
                      <input type="number" min="0" required placeholder="e.g. 500" value={form.capacity_used} onChange={(e) => setForm({ ...form, capacity_used: e.target.value })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Cost per Day (INR)</label>
                      <input type="number" min="0" required placeholder="e.g. 50" value={form.cost_per_day} onChange={(e) => setForm({ ...form, cost_per_day: e.target.value })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm" />
                    </div>
                  </div>
                )}

                {isDealer && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crop ID (from your won auction)</label>
                    <input type="number" min="0" placeholder="Enter crop ID" value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: e.target.value })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm" />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-green-700">
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <WarehouseIcon className="w-4 h-4" />}
                    {isFarmer ? 'Book Storage' : 'Request Pickup'}
                  </button>
                  <button type="button" onClick={() => { setShowBook(false); resetForm(); }} className="px-6 py-2.5 border-2 rounded-xl font-medium">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Bookings */}
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-10"><RefreshCw className="w-6 h-6 text-green-600 animate-spin mx-auto" /></div>
          ) : bookings.length === 0 ? (
            <div className="col-span-2 text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No warehouse bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Book storage to get started</p>
            </div>
          ) : bookings.map((b) => {
            const st = STATUS_MAP[b.status] || STATUS_MAP.requested;
            const StatusIcon = st.icon;
            return (
              <motion.div key={b.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold">{b.warehouse_name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${st.color}`}><StatusIcon className="w-3 h-3" /> {st.label}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p>Capacity: <span className="font-medium">{b.capacity_used} kg</span></p>
                  <p className="font-bold text-green-700">₹{b.cost_per_day}/day</p>
                  {b.crop_id && <p>Crop ID: <span className="font-medium">{b.crop_id}</span></p>}
                </div>
                <div className="flex gap-2">
                  {b.status === 'requested' && <button onClick={() => handleAction(b.id, 'confirm')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Confirm</button>}
                  {b.status === 'confirmed' && <button onClick={() => handleAction(b.id, 'store')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Store Crop</button>}
                  {b.status === 'stored' && <button onClick={() => handleAction(b.id, 'release')} className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Release</button>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
