import { motion } from 'framer-motion';
import { MapPin, Warehouse, Store, Truck, CheckCircle, Clock, Package } from 'lucide-react';

const stages = [
  { id: 0, label: 'Farm', icon: MapPin, color: 'green', desc: 'Crop harvested' },
  { id: 1, label: 'In Transit', icon: Truck, color: 'blue', desc: 'En route to warehouse' },
  { id: 2, label: 'APMC Godown', icon: Warehouse, color: 'purple', desc: 'Quality verified & stored' },
  { id: 3, label: 'Out for Delivery', icon: Truck, color: 'orange', desc: 'Heading to buyer' },
  { id: 4, label: 'Delivered', icon: Store, color: 'green', desc: 'At buyer center' },
];

export default function LogisticsTracker({ currentStage = 0, booking }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-lg">Hub & Spoke Logistics</h3>
        {booking && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-auto">#{booking.id}</span>}
      </div>

      <div className="relative flex justify-between items-start mb-8">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
          />
        </div>

        {stages.map((stage, i) => {
          const isActive = i <= currentStage;
          const isCurrent = i === currentStage;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative flex flex-col items-center z-10" style={{ width: `${100 / stages.length}%` }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCurrent ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-110' :
                  isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isActive && !isCurrent ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </motion.div>
              <p className={`text-xs font-bold text-center ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{stage.label}</p>
              <p className="text-xs text-gray-400 text-center mt-0.5 hidden md:block">{stage.desc}</p>
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>

      {booking && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Pickup</p>
            <p className="font-bold">{booking.pickup || 'Nashik Farm'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Warehouse</p>
            <p className="font-bold">{booking.warehouse || 'Pune APMC'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Delivery</p>
            <p className="font-bold">{booking.delivery || 'Mumbai Center'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-gray-500 text-xs">Cost</p>
            <p className="font-bold text-green-700">₹{booking.cost || 450}</p>
          </div>
        </div>
      )}
    </div>
  );
}
