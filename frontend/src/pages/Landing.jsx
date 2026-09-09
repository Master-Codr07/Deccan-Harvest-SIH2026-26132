import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { Sprout, TrendingUp, Shield, Truck, ArrowRight, Globe, Zap, Users, IndianRupee } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

export default function Landing() {
  const { t, lang, toggleLang } = useLang();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sprout className="w-8 h-8 text-green-600" />
          <span className="text-2xl font-bold text-green-800">Deccan Harvest</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleLang} className="flex items-center gap-1 px-3 py-1 border rounded-lg text-sm hover:bg-white/50">
            <Globe className="w-4 h-4" /> {lang === 'en' ? 'मराठी' : 'English'}
          </button>
          <Link to="/login" className="px-5 py-2 text-green-700 hover:text-green-900 font-medium">{t.nav.login}</Link>
          <Link to="/register" className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">{t.nav.register}</Link>
        </div>
      </nav>

      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <motion.div variants={fadeUp}>
          <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-1 rounded-full mb-6">Smart India Hackathon 2026 - PS 26132</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">{t.landing.hero}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">{t.landing.heroSub}</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg flex items-center gap-2 shadow-lg shadow-green-200">
              {t.landing.getStarted} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: TrendingUp, title: t.landing.impact, desc: t.landing.impactDesc, color: 'green' },
            { icon: Zap, title: t.landing.versatility, desc: t.landing.versatilityDesc, color: 'blue' },
            { icon: Shield, title: t.landing.feasibility, desc: t.landing.feasibilityDesc, color: 'purple' },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
              <item.icon className={`w-12 h-12 text-${item.color}-600 mb-4`} />
              <h3 className="font-bold text-xl mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12">{t.landing.howItWorks}</motion.h2>
        <div className="flex flex-wrap justify-center gap-3">
          {t.landing.steps.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 shadow-md">
              <span className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{step}</span>
              {i < 6 && <ArrowRight className="w-4 h-4 text-gray-400 hidden md:block" />}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Sprout, title: t.landing.farmer, desc: 'Upload crops, get verified, receive best prices', color: 'green' },
            { icon: TrendingUp, title: t.landing.dealer, desc: 'Browse verified crops, bid live, secure deals', color: 'blue' },
            { icon: Shield, title: t.landing.officer, desc: 'Verify, manage auctions, monitor ecosystem', color: 'purple' },
            { icon: Truck, title: t.nav.transport, desc: 'Book transport, warehouse, end-to-end logistics', color: 'orange' },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:scale-105 transition-transform">
              <item.icon className={`w-10 h-10 text-${item.color}-600 mx-auto mb-3`} />
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Indian Agriculture?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of farmers and buyers on the most transparent agricultural marketplace.</p>
          <Link to="/register" className="px-8 py-3 bg-white text-green-700 rounded-xl font-bold text-lg hover:bg-green-50 inline-flex items-center gap-2">
            {t.landing.getStarted} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>Deccan Harvest - Smart India Hackathon 2026 | Digital APMC Ecosystem</p>
      </footer>
    </div>
  );
}
