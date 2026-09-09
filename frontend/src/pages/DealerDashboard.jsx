import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import DeccanWallet from '../components/DeccanWallet';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { auctions as auctionsApi, escrow as escrowApi } from '../api';
import { Gavel, Timer, Zap, Trophy, MapPin, X, CheckCircle, AlertTriangle, Shield, Wallet, RefreshCw, TrendingUp, User } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const CROP_IMAGES = {
  'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
  'Cotton': 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=600&h=400&fit=crop',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop',
};

const getFloor = (basePrice) => parseFloat((basePrice * 1.15).toFixed(2));
const getMaxBid = (currentBid) => parseFloat((currentBid * 1.20).toFixed(2));
const ESCROW_FEE_RATE = 0.15;

function BidFeed({ auctionId }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevCount = useRef(0);

  const fetchBids = useCallback(async () => {
    try {
      const { data } = await auctionsApi.bids(auctionId);
      setBids(data);
      prevCount.current = data.length;
    } catch {}
    setLoading(false);
  }, [auctionId]);

  useEffect(() => { fetchBids(); }, [fetchBids]);
  useEffect(() => { const iv = setInterval(fetchBids, 2000); return () => clearInterval(iv); }, [fetchBids]);

  if (loading && bids.length === 0) return null;

  return (
    <div className="mt-2 mb-1">
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
        <TrendingUp className="w-3 h-3" /> Bid Activity
      </div>
      <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {bids.slice(0, 8).map((bid, i) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs ${i === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                  <User className="w-3 h-3" />
                </div>
                <span className={`font-medium ${i === 0 ? 'text-green-700' : 'text-gray-600'}`}>
                  {bid.buyer_name || `Buyer #${bid.buyer_id}`}
                </span>
              </div>
              <span className={`font-bold ${i === 0 ? 'text-green-700' : 'text-gray-500'}`}>
                ₹{bid.amount.toFixed(0)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {bids.length === 0 && <p className="text-[10px] text-gray-400 text-center py-1">No bids yet</p>}
      </div>
    </div>
  );
}

function BiddingTicker({ auction }) {
  const floor = getFloor(auction.base_price);
  const maxBid = getMaxBid(auction.highest_bid);
  const minBid = parseFloat((auction.highest_bid + 0.50).toFixed(2));

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 mb-3">
      <div className="flex items-center gap-1 text-xs font-bold text-green-700 mb-2">
        <Shield className="w-3 h-3" /> Live Bidding Range
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-white rounded-lg border border-green-200">
          <p className="text-gray-500 mb-0.5">Min Bid</p>
          <p className="font-bold text-green-700 text-sm">₹{minBid}</p>
        </div>
        <div className="text-center p-2 bg-green-600 text-white rounded-lg">
          <p className="text-green-100 mb-0.5">Current</p>
          <p className="font-bold text-sm">₹{auction.highest_bid.toFixed(2)}</p>
        </div>
        <div className="text-center p-2 bg-white rounded-lg border border-orange-200">
          <p className="text-gray-500 mb-0.5">Max (+20%)</p>
          <p className="font-bold text-orange-600 text-sm">₹{maxBid}</p>
        </div>
      </div>
    </div>
  );
}

function AuctionTimer({ timerEnd, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [urgent, setUrgent] = useState(false);
  const expired = useRef(false);

  useEffect(() => {
    if (!timerEnd) { setSecondsLeft(0); return; }
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(timerEnd).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      setUrgent(diff <= 10);
      if (diff <= 0 && !expired.current) {
        expired.current = true;
        onExpire?.();
      }
    };
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [timerEnd, onExpire]);

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${urgent ? 'bg-red-100 text-red-700 animate-pulse border border-red-300' : 'bg-gray-100 text-gray-700'}`}>
      <Timer className={`w-4 h-4 ${urgent ? 'text-red-600' : 'text-gray-500'}`} />
      <span>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>
    </div>
  );
}

export default function DealerDashboard() {
  const { t } = useLang();
  const { user, updateWallet } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wonItems, setWonItems] = useState([]);
  const [userHighest, setUserHighest] = useState({});
  const [showBidModal, setShowBidModal] = useState(null);
  const [showEscrowModal, setShowEscrowModal] = useState(null);
  const [tab, setTab] = useState('feed');
  const [bidAmounts, setBidAmounts] = useState({});
  const [bidError, setBidError] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [escrowState, setEscrowState] = useState({});
  const [releaseState, setReleaseState] = useState({});
  const [expandedFeed, setExpandedFeed] = useState(null);

  const fetchAuctions = useCallback(async () => {
    try {
      const { data } = await auctionsApi.live();
      setAuctions(data);
      setError('');
    } catch (err) {
      console.error('Failed to load auctions:', err);
      setError('Failed to load auctions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWon = useCallback(async () => {
    try {
      const { data } = await auctionsApi.won();
      setWonItems(data.filter((a) => a.highest_bidder_id === user?.id));
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => { fetchAuctions(); fetchWon(); }, [fetchAuctions, fetchWon]);
  useEffect(() => { const iv = setInterval(() => { fetchAuctions(); fetchWon(); }, 3000); return () => clearInterval(iv); }, [fetchAuctions, fetchWon]);

  const validateBid = (auction, bidAmt) => {
    const floor = getFloor(auction.base_price);
    if (bidAmt < floor) return `Bid must be at least ₹${floor} (15% floor)`;
    if (bidAmt <= auction.highest_bid) return `Must be higher than ₹${auction.highest_bid.toFixed(2)}`;
    const maxBid = getMaxBid(auction.highest_bid);
    if (bidAmt > maxBid) return `Max allowed is ₹${maxBid} (20% above current)`;
    return '';
  };

  const placeBid = async (auctionId) => {
    const auction = auctions.find((a) => a.auction_id === auctionId);
    const amt = parseFloat(bidAmounts[auctionId]);
    const err = validateBid(auction, amt);
    if (err) { setBidError(err); return; }
    setBidLoading(true);
    setBidError('');
    try {
      await auctionsApi.bid(auctionId, amt);
      setUserHighest((uh) => ({ ...uh, [auctionId]: true }));
      setBidAmounts((a) => ({ ...a, [auctionId]: '' }));
      setShowBidModal(null);
      fetchAuctions();
    } catch (err) {
      setBidError(err.response?.data?.detail || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  const handleEscrowPay = async (auctionId) => {
    setEscrowState((s) => ({ ...s, [auctionId]: 'processing' }));
    try {
      await escrowApi.hold(auctionId);
      setEscrowState((s) => ({ ...s, [auctionId]: 'paid' }));
      setShowEscrowModal(null);
      fetchWon();
    } catch (err) {
      alert(err.response?.data?.detail || 'Payment failed');
      setEscrowState((s) => ({ ...s, [auctionId]: null }));
    }
  };

  const handleRelease = async (escrowId) => {
    setReleaseState((s) => ({ ...s, [escrowId]: 'releasing' }));
    try {
      await escrowApi.release(escrowId);
      setReleaseState((s) => ({ ...s, [escrowId]: 'released' }));
      fetchWon();
    } catch (err) { alert(err.response?.data?.detail || 'Release failed'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Marketplace</h1>
            <p className="text-sm text-gray-500">1-min timer per bid · 15% floor · 20% max increment</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchAuctions(); fetchWon(); }} className="p-2 bg-white border rounded-xl hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
            <DeccanWallet compact />
          </div>
        </div>
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {[['feed', '🏪 Feed'], ['won', '🏆 Won'], ['wallet', '💰 Wallet']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${tab === k ? 'bg-green-600 text-white shadow-lg' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm">{error}</div>}

        {tab === 'feed' && (
          <div>
            {auctions.length === 0 ? (
              <div className="text-center py-20">
                <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">No live auctions yet</p>
                <p className="text-sm text-gray-400 mt-1">Auctions appear after an officer verifies a crop</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctions.map((auction, i) => {
                  const image = auction.image_url || CROP_IMAGES[auction.crop_name] || CROP_IMAGES.default;
                  const isHighest = auction.highest_bidder_id === user?.id;
                  return (
                    <motion.div key={auction.auction_id} initial="hidden" animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { delay: i * 0.05 } } }} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all">
                      <div className="relative h-44 overflow-hidden">
                        <img src={image} alt={auction.crop_name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.src = CROP_IMAGES.default; }} />
                        <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-lg border shadow-sm bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> LIVE
                        </span>
                        <div className="absolute top-3 right-3">
                          <AuctionTimer timerEnd={auction.timer_end} onExpire={() => { fetchAuctions(); fetchWon(); }} />
                        </div>
                        {isHighest && (
                          <span className="absolute bottom-3 right-3 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold shadow"><Shield className="w-3 h-3" /> You're Highest</span>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-bold text-lg">{auction.crop_name}</h3>
                            <p className="text-xs text-gray-400">Farmer: {auction.farmer_name}</p>
                          </div>
                          <motion.p key={auction.highest_bid} initial={{ scale: 1.3, color: '#16a34a' }} animate={{ scale: 1 }} className="text-xl font-extrabold text-green-700">₹{auction.highest_bid.toFixed(0)}<span className="text-xs text-gray-500 font-normal">/unit</span></motion.p>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" /> {auction.location}</p>

                        <BiddingTicker auction={auction} />

                        <button onClick={() => setExpandedFeed(expandedFeed === auction.auction_id ? null : auction.auction_id)} className="text-[10px] text-gray-400 hover:text-gray-600 mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {expandedFeed === auction.auction_id ? 'Hide' : 'Show'} bid activity
                        </button>
                        {expandedFeed === auction.auction_id && <BidFeed auctionId={auction.auction_id} />}

                        <button onClick={() => { setShowBidModal(auction.auction_id); setBidError(''); setBidAmounts((a) => ({ ...a, [auction.auction_id]: '' })); }} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center justify-center gap-1 mt-1">
                          <Gavel className="w-4 h-4" /> Place Bid
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'won' && (
          <div className="space-y-4">
            {wonItems.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg font-medium">No items won yet</p>
              </div>
            ) : wonItems.map((item) => {
              const payState = escrowState[item.id];
              return (
                <motion.div key={item.id} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <Trophy className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Auction #{item.id}</h3>
                      <p className="text-sm text-gray-600">Won at ₹{item.highest_bid.toFixed(2)}/unit</p>
                      <p className="text-xs text-gray-400">Crop ID: {item.crop_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-green-700">₹{item.highest_bid.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">+ ₹{(item.highest_bid * ESCROW_FEE_RATE).toFixed(2)} fee</p>
                    </div>
                  </div>

                  {payState === 'paid' ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-700">Payment Complete — ₹{(item.highest_bid * 1.15).toFixed(2)}</p>
                      <p className="text-xs text-green-600 mt-1">Farmer will receive ₹{item.highest_bid.toFixed(2)} after APMC releases escrow</p>
                    </div>
                  ) : payState === 'processing' ? (
                    <button disabled className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" /> Processing...
                    </button>
                  ) : (
                    <div>
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-gray-600">Winning Bid</span><span className="font-bold">₹{item.highest_bid.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Platform Fee (+15%)</span><span className="font-bold text-orange-600">₹{(item.highest_bid * ESCROW_FEE_RATE).toFixed(2)}</span></div>
                        <div className="flex justify-between border-t pt-1"><span className="font-bold">Total Payable</span><span className="font-extrabold text-green-700 text-lg">₹{(item.highest_bid * 1.15).toFixed(2)}</span></div>
                      </div>
                      <button onClick={() => handleEscrowPay(item.id)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2">
                        <Wallet className="w-5 h-5" /> Pay ₹{(item.highest_bid * 1.15).toFixed(2)} via Escrow
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {tab === 'wallet' && <DeccanWallet />}
      </div>

      <AnimatePresence>
        {showBidModal && (() => {
          const auction = auctions.find((a) => a.auction_id === showBidModal);
          if (!auction) return null;
          const minBid = parseFloat((auction.highest_bid + 0.50).toFixed(2));
          const maxBid = getMaxBid(auction.highest_bid);
          const bidAmt = parseFloat(bidAmounts[auction.auction_id]) || 0;
          const err = bidAmt > 0 ? validateBid(auction, bidAmt) : '';
          const isValid = bidAmt > 0 && !err && !bidLoading;
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBidModal(null)}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Place Your Bid</h3>
                  <button onClick={() => setShowBidModal(null)}><X className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Gavel className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold">{auction.crop_name}</p>
                    <p className="text-xs text-gray-500">Farmer: {auction.farmer_name}</p>
                  </div>
                </div>

                <BiddingTicker auction={auction} />

                <BidFeed auctionId={auction.auction_id} />

                <div className="mb-4">
                  <AuctionTimer timerEnd={auction.timer_end} />
                </div>

                <p className="text-sm font-medium text-gray-700 mb-1">Your Bid (₹ per unit)</p>
                <input
                  type="number"
                  min={minBid}
                  max={maxBid}
                  step="0.50"
                  placeholder={`₹${minBid} — ₹${maxBid}`}
                  value={bidAmounts[auction.auction_id] || ''}
                  onChange={(e) => { setBidAmounts({ ...bidAmounts, [auction.auction_id]: Math.max(0, parseFloat(e.target.value) || 0).toString() }); setBidError(''); }}
                  onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                  className="w-full px-4 py-3 border-2 rounded-xl text-lg font-bold mb-1"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mb-2">Valid: ₹{minBid} to ₹{maxBid}</p>
                {(err || bidError) && <p className="text-red-500 text-xs mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {err || bidError}</p>}
                <button onClick={() => placeBid(auction.auction_id)} disabled={!isValid} className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all mt-2 ${isValid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
                  {bidLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Gavel className="w-5 h-5" /> Confirm Bid</>}
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
