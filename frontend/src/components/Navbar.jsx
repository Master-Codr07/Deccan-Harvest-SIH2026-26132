import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { Sprout, LogOut, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const dashLink = user?.role === 'farmer' ? '/farmer' : user?.role === 'dealer' ? '/dealer' : user?.role === 'apmc_officer' ? '/officer' : '/admin';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Sprout className="w-6 h-6 text-green-600" />
        <span className="text-xl font-bold text-green-800">Deccan Harvest</span>
      </Link>
      <div className="flex items-center gap-4">
        {user?.role === 'farmer' && <Link to="/transport" className="text-sm text-gray-600 hover:text-green-700">{t.nav.transport}</Link>}
        {user?.role === 'dealer' && <Link to="/warehouse" className="text-sm text-gray-600 hover:text-green-700">{t.nav.warehouse}</Link>}
        <button onClick={toggleLang} className="flex items-center gap-1 text-sm px-2 py-1 border rounded-lg hover:bg-gray-50">
          <Globe className="w-3 h-3" /> {lang === 'en' ? 'मराठी' : 'English'}
        </button>
        {user && (
          <>
            <span className="text-sm text-gray-600">{user.name}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">{user.role.replace('_', ' ')}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-sm">
              <LogOut className="w-4 h-4" /> {t.nav.logout}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
