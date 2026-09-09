import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { transport } from '../api';
import { warehouses, maharashtraDistricts } from '../data';
import { Truck, MapPin, ArrowRight, Warehouse as WarehouseIcon, IndianRupee, RefreshCw, X, CheckCircle, Clock, Package } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const VEHICLE_TYPES = [
  { value: 'truck', label: 'Truck (10 tonnes)' },
  { value: 'tempo', label: 'Tempo (2 tonnes)' },
  { value: 'trailer', label: 'Refrigerated Truck' },
];

const STATUS_MAP = {
  requested: { color: 'bg-yellow-100 text-yellow-700', label: 'Requested', icon: Clock },
  accepted: { color: 'bg-blue-100 text-blue-700', label: 'Accepted', icon: Truck },
  in_transit: { color: 'bg-purple-100 text-purple-700', label: 'In Transit', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered', icon: CheckCircle },
};

export default function TransportPage() {
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';
  const [bookings, setBookings] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pickup_location: '',
    delivery_warehouse_id: '',
    pickup_warehouse_id: '',
    delivery_location: '',
    vehicle_type: 'truck',
    crop_id: '',
  });

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try { const { data } = await transport.list(); setBookings(data); } catch {}
    setLoading(false);
  };

  const resetForm = () => setForm({
    pickup_location: '', delivery_warehouse_id: '', pickup_warehouse_id: '',
    delivery_location: '', vehicle_type: 'truck', crop_id: '',
  });

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        pickup_location: form.pickup_location,
        delivery_location: isFarmer
          ? warehouses.find(w => w.id === parseInt(form.delivery_warehouse_id))?.location || ''
          : form.delivery_location,
        vehicle_type: form.vehicle_type,
        crop_id: form.crop_id ? parseInt(form.crop_id) : undefined,
        warehouse_id: isFarmer ? parseInt(form.delivery_warehouse_id) : parseInt(form.pickup_warehouse_id),
      };
      await transport.book(payload);
      setShowBook(false);
      resetForm();
      loadBookings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to book transport'); }
    setSubmitting(false);
  };

  const handleStatus = async (id, status) => {
    try { await transport.updateStatus(id, status); loadBookings(); }
    catch (err) { alert(err.response?.data?.detail || 'Failed to update status'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transport Booking</h1>
            <p className="text-sm text-gray-500">
              {isFarmer ? 'Ship your crops from farm to APMC warehouse' : 'Collect your produce from warehouse'}
            </p>
          </div>
          <button onClick={() => { setShowBook(true); resetForm(); }} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-medium">
            <Truck className="w-4 h-4" /> New Booking
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-sm mb-3 text-gray-700">Hub & Spoke Logistics</h3>
          <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
            <div className={`px-3 py-2 rounded-lg text-center ${isFarmer ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
              <p className="font-bold">{isFarmer ? 'You' : 'Farmer'}</p>
              <p className="text-[10px]">{isFarmer ? 'Your Farm' : 'Crops'}</p>
            </div>
            <ArrowRight className="text-gray-400 w-4 h-4" />
            <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-center">
              <p className="font-bold">APMC Warehouse</p>
              <p className="text-[10px]">Storage + Quality</p>
            </div>
            <ArrowRight className="text-gray-400 w-4 h-4" />
            <div className={`px-3 py-2 rounded-lg text-center ${!isFarmer ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'}`}>
              <p className="font-bold">{!isFarmer ? 'You' : 'Buyer'}</p>
              <p className="text-[10px]">{!isFarmer ? 'Your Destination' : 'Retail'}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showBook && (
            <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeUp} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg">
                  {isFarmer ? 'Ship to Warehouse' : 'Collect from Warehouse'}
                </h3>
                <button onClick={() => { setShowBook(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                {isFarmer ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pickup Location (Your Farm)</label>
                      <select required value={form.pickup_location} onChange={(e) => setForm({ ...form, pickup_location: e.target.value })} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white">
                        <option value="">Select your district</option>
                        {maharashtraDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Destination Warehouse</label>
                      <select required value={form.delivery_warehouse_id} onChange={(e) => setForm({ ...form, delivery_warehouse_id: e.target.value })} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white">
                        <option value="">Select APMC warehouse</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.location}) - {(w.capacity / 1000).toFixed(0)}K kg capacity</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pickup Warehouse</label>
                      <select required value={form.pickup_warehouse_id} onChange={(e) => setForm({ ...form, pickup_warehouse_id: e.target.value })} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Select APMC warehouse</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.location}) - {(w.capacity / 1000).toFixed(0)}K kg capacity</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Delivery Location (Your Place)</label>
                      <select required value={form.delivery_location} onChange={(e) => setForm({ ...form, delivery_location: e.target.value })} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                        <option value="">Select your district</option>
                        {maharashtraDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {VEHICLE_TYPES.map(v => (
                      <button key={v.value} type="button" onClick={() => setForm({ ...form, vehicle_type: v.value })} className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${form.vehicle_type === v.value ? (isFarmer ? 'border-green-500 bg-green-50 text-green-700' : 'border-blue-500 bg-blue-50 text-blue-700') : 'border-gray-200 hover:border-gray-300'}`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crop ID (optional)</label>
                  <input type="number" min="0" placeholder="Enter crop listing ID" value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: e.target.value })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="w-full px-4 py-2.5 border-2 rounded-xl text-sm" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={submitting} className={`${isFarmer ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2`}>
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                    {isFarmer ? 'Book Transport to Warehouse' : 'Book Collection from Warehouse'}
                  </button>
                  <button type="button" onClick={() => { setShowBook(false); resetForm(); }} className="px-6 py-2.5 border-2 rounded-xl font-medium">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-10"><RefreshCw className="w-6 h-6 text-green-600 animate-spin mx-auto" /></div>
          ) : bookings.length === 0 ? (
            <div className="col-span-2 text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No bookings yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first transport booking above</p>
            </div>
          ) : bookings.map((b) => {
            const st = STATUS_MAP[b.status] || STATUS_MAP.requested;
            const StatusIcon = st.icon;
            return (
              <motion.div key={b.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">Booking #{b.id}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${st.color}`}><StatusIcon className="w-3 h-3" /> {st.label}</span>
                </div>
                <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-green-500" /> <span className="font-medium">{b.pickup_location}</span> → <span className="font-medium">{b.delivery_location}</span></p>
                  <p>Vehicle: <span className="font-medium capitalize">{b.vehicle_type}</span></p>
                  {b.estimated_cost && <p className="flex items-center gap-1 font-bold text-green-700"><IndianRupee className="w-3 h-3" /> {b.estimated_cost}</p>}
                </div>
                <div className="flex gap-2">
                  {b.status === 'requested' && <button onClick={() => handleStatus(b.id, 'accepted')} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Accept</button>}
                  {b.status === 'accepted' && <button onClick={() => handleStatus(b.id, 'in_transit')} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Start Transit</button>}
                  {b.status === 'in_transit' && <button onClick={() => handleStatus(b.id, 'delivered')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">Mark Delivered</button>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
