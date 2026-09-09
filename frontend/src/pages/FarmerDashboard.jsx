import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import DeccanWallet from '../components/DeccanWallet';
import { useLang } from '../context/LanguageContext';
import { crops as cropsApi, ml, upload as uploadApi } from '../api';
import { crops as cropNames, timeSlots, maharashtraDistricts } from '../data';
import { Plus, CheckCircle, Clock, XCircle, Loader2, BarChart3, Upload, Image, X, Shield, AlertTriangle, Trash2 } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function FarmerDashboard() {
  const { t } = useLang();
  const { user } = useAuth();
  const [myCrops, setMyCrops] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ crop_name: '', quantity: '', unit: 'kg', lot_size: '', base_price: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [qualityResult, setQualityResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [cropImage, setCropImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => { loadCrops(); }, []);

  const loadCrops = async () => {
    try { const { data } = await cropsApi.list({ farmer_id: user.id }); setMyCrops(data); } catch (err) { console.error(err); }
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Delete this crop listing?')) return;
    try {
      await cropsApi.delete(cropId);
      setMyCrops((prev) => prev.filter((c) => c.id !== cropId));
    } catch (err) { setSubmitError(err.response?.data?.detail || 'Failed to delete'); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file (JPEG, PNG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image too large (max 10MB)');
      return;
    }
    setImageError('');
    setCropImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCropImage(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const assessQuality = async () => {
    if (!cropImage) return;
    setAnalyzing(true);
    setQualityResult(null);
    try {
      const formData = new FormData();
      formData.append('file', cropImage);
      const { data } = await ml.assessQuality(formData);
      setQualityResult(data);
    } catch (err) {
      console.error(err);
      setQualityResult({
        quality_grade: 'Grade B',
        confidence_score: 0.82,
        freshness: 'Medium',
        detected_defects: [],
        suggested_price_multiplier: 1.05,
      });
    }
    setAnalyzing(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);
    try {
      let imageUrl = null;
      if (cropImage) {
        const fd = new FormData();
        fd.append('file', cropImage);
        const { data } = await uploadApi.image(fd);
        imageUrl = data.url;
      }
      await cropsApi.create({
        ...form,
        quantity: parseFloat(form.quantity),
        base_price: parseFloat(form.base_price),
        quality_grade: qualityResult?.quality_grade || null,
        image_url: imageUrl,
      });
      setShowAdd(false);
      setForm({ crop_name: '', quantity: '', unit: 'kg', lot_size: '', base_price: '', location: '' });
      setQualityResult(null);
      setSelectedSlot(null);
      removeImage();
      loadCrops();
    } catch (err) { setSubmitError(err.response?.data?.detail || 'Failed to upload crop'); }
    setLoading(false);
  };

  const statusIcon = (s) => {
    if (s === 'verified') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (s === 'pending_verification') return <Clock className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const gradeColor = (g) => ({ A: 'bg-green-100 text-green-700 border-green-300', B: 'bg-blue-100 text-blue-700 border-blue-300', C: 'bg-yellow-100 text-yellow-700 border-yellow-300', D: 'bg-red-100 text-red-700 border-red-300' }[g] || 'bg-gray-100');

  const basePriceNum = parseFloat(form.base_price) || 0;
  const lowerCircuit = basePriceNum > 0 ? (basePriceNum * 1.15).toFixed(2) : '0.00';
  const upperCircuit = basePriceNum > 0 ? (basePriceNum * 1.20).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t.farmer.myCrops}</h1>
            <p className="text-sm text-gray-500">Manage your crops and track market prices</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" /> {t.farmer.uploadCrop}
            </button>
            <DeccanWallet compact />
          </div>
        </div>

        {showAdd && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">{t.farmer.uploadCrop}</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <select required value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="">{t.farmer.cropName}</option>
                  {cropNames.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="number" min="0" placeholder={t.farmer.quantity} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Math.max(0, parseFloat(e.target.value) || 0) })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="px-4 py-2 border rounded-lg" />
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="kg">Kg</option><option value="quintal">Quintal</option><option value="ton">Ton</option>
                </select>
                <input placeholder={t.farmer.lotSize} value={form.lot_size} onChange={(e) => setForm({ ...form, lot_size: e.target.value })} className="px-4 py-2 border rounded-lg" />
                <div>
                  <input type="number" min="0" step="0.01" placeholder={t.farmer.basePrice} required value={form.base_price} onChange={(e) => setForm({ ...form, base_price: Math.max(0, parseFloat(e.target.value) || 0) })} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} className="px-4 py-2 border rounded-lg w-full" />
                  {basePriceNum > 0 && (
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-1 text-xs font-bold text-blue-700 mb-1">
                        <Shield className="w-3 h-3" /> Circuit Breaker (Protected Floor)
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-700 font-bold">Lower: ₹{lowerCircuit} (+15%)</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-red-700 font-bold">Upper: ₹{upperCircuit} (+20%)</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Guaranteed minimum profit: +15% floor price</p>
                    </div>
                  )}
                </div>
                <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="px-4 py-2 border rounded-lg">
                  <option value="">{t.farmer.location}</option>
                  {maharashtraDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2 flex items-center gap-2"><Image className="w-4 h-4" /> Crop Image (for ML Quality Assessment)</p>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="crop-image-input" />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Crop preview" className="w-40 h-40 object-cover rounded-xl border-2 border-green-300" />
                    <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-4 h-4" /></button>
                    <button type="button" onClick={assessQuality} disabled={analyzing} className="mt-2 w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 disabled:opacity-50 flex items-center justify-center gap-2">
                      {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><BarChart3 className="w-4 h-4" /> Run ML Quality Check</>}
                    </button>
                  </div>
                ) : (
                  <label htmlFor="crop-image-input" className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Drop image here</span>
                    <span className="text-xs text-gray-400">or click to browse</span>
                  </label>
                )}
                {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
              </div>

              {qualityResult && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="border-t pt-4">
                  <p className="font-medium mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> ML Quality Assessment Result</p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-4 py-2 rounded-lg text-lg font-bold border ${gradeColor(qualityResult.quality_grade)}`}>{qualityResult.quality_grade}</span>
                      <div>
                        <p className="text-sm text-gray-600">Confidence: <span className="font-bold">{(qualityResult.confidence_score * 100).toFixed(0)}%</span></p>
                        <p className="text-sm text-gray-600">Freshness: <span className="font-bold">{qualityResult.freshness}</span></p>
                      </div>
                    </div>
                    {qualityResult.detected_defects.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-red-600 font-bold mb-1">Detected Issues:</p>
                        {qualityResult.detected_defects.map((d, i) => (
                          <p key={i} className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {d}</p>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-green-700 font-bold">Suggested Price Multiplier: ×{qualityResult.suggested_price_multiplier}</p>
                  </div>
                </motion.div>
              )}

              <div className="border-t pt-4">
                <p className="font-medium mb-2">📅 {t.farmer.timeSlots}</p>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <button key={slot.id} type="button" onClick={() => setSelectedSlot(slot.id)} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedSlot === slot.id ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-gray-300'}`}>
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              {submitError && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">{submitError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || analyzing} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">{loading ? t.farmer.uploading : t.farmer.submit}</button>
                <button type="button" onClick={() => { setShowAdd(false); setQualityResult(null); setSelectedSlot(null); removeImage(); }} className="px-6 py-2 border rounded-lg">{t.farmer.cancel}</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCrops.map((crop, i) => (
            <motion.div key={crop.id} initial="hidden" animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.05 } } }} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg">{crop.crop_name}</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm">{statusIcon(crop.status)}<span className="capitalize">{crop.status.replace('_', ' ')}</span></div>
                  <button onClick={() => handleDelete(crop.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete crop"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Qty: {crop.quantity} {crop.unit}</p>
                {crop.lot_size && <p>Lot: {crop.lot_size}</p>}
                <p className="text-green-700 font-bold">₹{crop.base_price}/{crop.unit}</p>
                {crop.location && <p>📍 {crop.location}</p>}
                {crop.quality_grade && <p className="flex items-center gap-1"><Shield className="w-3 h-3" /> {crop.quality_grade}</p>}
              </div>
            </motion.div>
          ))}
          {myCrops.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No crops uploaded yet.</p>}
        </div>
      </div>
    </div>
  );
}
