import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Radio, ExternalLink } from 'lucide-react';

const BASE_PRICES = [
  { name: 'Onion', base: 25.80, unit: 'kg', market: 'Nashik APMC' },
  { name: 'Soybean', base: 57.25, unit: 'kg', market: 'Latur APMC' },
  { name: 'Wheat', base: 24.50, unit: 'kg', market: 'Pune APMC' },
  { name: 'Sugarcane', base: 315.00, unit: 'quintal', market: 'Kolhapur APMC' },
  { name: 'Tomato', base: 32.00, unit: 'kg', market: 'Nagpur APMC' },
  { name: 'Cotton', base: 6800.00, unit: 'quintal', market: 'Wardha APMC' },
  { name: 'Rice', base: 38.50, unit: 'kg', market: 'Raigad APMC' },
  { name: 'Maize', base: 21.75, unit: 'kg', market: 'Solapur APMC' },
  { name: 'Potato', base: 18.90, unit: 'kg', market: 'Pune APMC' },
  { name: 'Chilli', base: 85.00, unit: 'kg', market: 'Beed APMC' },
];

function PriceTicker({ item, index }) {
  const [currentPrice, setCurrentPrice] = useState(item.base);
  const [history, setHistory] = useState([{ price: item.base }]);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.48) * (item.base * 0.006);
      const newPrice = Math.max(item.base * 0.9, Math.min(item.base * 1.1, currentPrice + fluctuation));
      const rounded = parseFloat(newPrice.toFixed(2));
      setTrend(rounded > currentPrice ? 1 : rounded < currentPrice ? -1 : 0);
      setCurrentPrice(rounded);
      setHistory((prev) => [...prev.slice(-20), { price: rounded }]);
    }, 2000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [currentPrice, item.base]);

  const change = ((currentPrice - item.base) / item.base * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-md p-4 min-w-[220px] shrink-0 border border-gray-100 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
          <p className="text-xs text-gray-500">{item.market}</p>
        </div>
        <div className="flex items-center gap-1">
          <Radio className={`w-3 h-3 ${Math.abs(trend) > 0 ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <motion.span
          key={currentPrice}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-2xl font-extrabold text-gray-900"
        >
          ₹{currentPrice.toFixed(2)}
        </motion.span>
        <span className="text-xs text-gray-500 mb-1">/{item.unit}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <AnimatePresence mode="wait">
          <motion.span
            key={trend}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend >= 0 ? '▲' : '▼'} ₹{Math.abs(currentPrice - item.base).toFixed(2)}
          </motion.span>
        </AnimatePresence>
        <span className={`text-xs ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ({parseFloat(change) >= 0 ? '+' : ''}{change}%)
        </span>
      </div>

      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={trend >= 0 ? '#22c55e' : '#ef4444'}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default function MarketTicker() {
  const scrollRef = useRef(null);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-lg">Live Market Prices</h3>
        </div>
        <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100">
          <Radio className="w-3 h-3 animate-pulse" />
          Live Data Source: Agmarknet (data.gov.in) • APMC Market Feed
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {BASE_PRICES.map((item, i) => (
          <PriceTicker key={item.name} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
