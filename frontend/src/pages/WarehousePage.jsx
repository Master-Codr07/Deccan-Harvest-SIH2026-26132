import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { warehouse } from '../api';
import { Warehouse as WarehouseIcon, Plus } from 'lucide-react';

export default function WarehousePage() {
  const [bookings, setBookings] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [form, setForm] = useState({ warehouse_name: '', location: '', capacity_used: '', cost_per_day: '', crop_id: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try { const { data } = await warehouse.list(); setBookings(data); } catch (err) { console.error(err); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        warehouse_name: form.warehouse_name,
        location: form.location,
        capacity_used: parseFloat(form.capacity_used),
        cost_per_day: parseFloat(form.cost_per_day),
      };
      if (form.crop_id) payload.crop_id = parseInt(form.crop_id);
      await warehouse.book(payload);
      setShowBook(false);
      setForm({ warehouse_name: '', location: '', capacity_used: '', cost_per_day: '', crop_id: '' });
      loadBookings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
    setLoading(false);
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'confirm') await warehouse.confirm(id);
      else if (action === 'store') await warehouse.store(id);
      else await warehouse.release(id);
      loadBookings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const statusColor = (s) => {
    const map = { requested: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', stored: 'bg-green-100 text-green-700', released: 'bg-gray-100 text-gray-700' };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Warehouse Marketplace</h1>
          <button onClick={() => setShowBook(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"><Plus className="w-4 h-4" /> Book Warehouse</button>
        </div>

        {showBook && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Book Warehouse Storage</h3>
            <form onSubmit={handleBook} className="grid md:grid-cols-2 gap-4">
              <input placeholder="Warehouse Name" required value={form.warehouse_name} onChange={(e) => setForm({ ...form, warehouse_name: e.target.value })} className="px-4 py-2 border rounded-lg" />
              <input placeholder="Location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-4 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Capacity (kg)" required value={form.capacity_used} onChange={(e) => setForm({ ...form, capacity_used: Math.max(0, parseFloat(e.target.value) || 0) })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="px-4 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Cost per day (INR)" required value={form.cost_per_day} onChange={(e) => setForm({ ...form, cost_per_day: Math.max(0, parseFloat(e.target.value) || 0) })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="px-4 py-2 border rounded-lg" />
              <input type="number" min="0" placeholder="Crop ID (optional)" value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: e.target.value })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="px-4 py-2 border rounded-lg" />
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">{loading ? 'Booking...' : 'Book'}</button>
                <button type="button" onClick={() => setShowBook(false)} className="px-6 py-2 border rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold">{b.warehouse_name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status.toUpperCase()}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Location: {b.location}</p>
                <p>Capacity: {b.capacity_used} kg</p>
                <p className="font-bold text-green-700">₹{b.cost_per_day}/day</p>
                <p>Crop ID: {b.crop_id}</p>
              </div>
              <div className="mt-3 flex gap-2">
                {b.status === 'requested' && <button onClick={() => handleAction(b.id, 'confirm')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Confirm</button>}
                {b.status === 'confirmed' && <button onClick={() => handleAction(b.id, 'store')} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Store Crop</button>}
                {b.status === 'stored' && <button onClick={() => handleAction(b.id, 'release')} className="bg-orange-600 text-white px-3 py-1 rounded text-sm">Release</button>}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500 text-center py-10 col-span-2">No warehouse bookings yet.</p>}
        </div>
      </div>
    </div>
  );
}
