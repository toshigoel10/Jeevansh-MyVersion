import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MenuIcon, XIcon, UserIcon } from '../common/Icons';

export default function RequesterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'donor':
        return '/donor/dashboard';
      case 'bank':
        return '/bank/dashboard';
      case 'hospital':
        return '/hospital/dashboard';
      case 'seeker':
      default:
        return '/seeker/dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-10 h-10 rounded-xl bg-blood-600 text-white flex items-center justify-center text-xl shadow-md shadow-blood-600/30 group-hover:scale-105 transition-transform">
              🩸
            </span>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-gray-900">Jeevansh</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-blood-700 transition">
              Home
            </Link>
            <Link to="/request" className="text-sm font-semibold text-gray-700 hover:text-blood-700 transition">
              Find Blood
            </Link>
            <Link to="/register?role=donor" className="text-sm font-semibold text-gray-700 hover:text-blood-700 transition">
              Become a Donor
            </Link>
            <a href="#about" className="text-sm font-semibold text-gray-700 hover:text-blood-700 transition">
              About Us
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardRoute()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blood-50 text-blood-700 border border-blood-200 hover:bg-blood-100 transition"
                >
                  <UserIcon className="w-4 h-4 text-blood-600" />
                  <span>{user.name || 'Dashboard'}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blood-600 text-white rounded">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-800 px-3 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-blood-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-blood-600 text-white px-5 py-2.5 rounded-xl hover:bg-blood-700 shadow-md shadow-blood-600/20 transition active:scale-98"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-800 hover:text-blood-600"
            >
              Home
            </Link>
            <Link
              to="/request"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-800 hover:text-blood-600"
            >
              Find Blood
            </Link>
            <Link
              to="/register?role=donor"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-800 hover:text-blood-600"
            >
              Become a Donor
            </Link>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-semibold text-gray-800 hover:text-blood-600"
            >
              About Us
            </a>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-blood-600 text-white"
                  >
                    Go to {user.role?.toUpperCase()} Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-blood-600 text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white pt-16 pb-12 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🩸</span>
                <span className="text-xl font-bold tracking-tight text-white">Jeevansh</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Emergency Blood & Component Coordination Platform. Bridging the critical window between emergency need and voluntary donors.
              </p>
              <div className="pt-2 text-xs text-gray-500">
                A public healthcare initiative designed for life safety across India.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Quick Navigation</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/request" className="hover:text-blood-400 transition">Find Emergency Blood</Link></li>
                <li><Link to="/register?role=donor" className="hover:text-blood-400 transition">Become a Volunteer Donor</Link></li>
                <li><Link to="/login?role=hospital" className="hover:text-blood-400 transition">Hospital Emergency Desk</Link></li>
                <li><Link to="/login?role=bank" className="hover:text-blood-400 transition">Blood Bank Officer Portal</Link></li>
              </ul>
            </div>

            {/* Platform Roles */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Portals</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><Link to="/seeker/dashboard" className="hover:text-blood-400 transition">Blood Seeker Hub</Link></li>
                <li><Link to="/donor/dashboard" className="hover:text-blood-400 transition">Donor Impact Dashboard</Link></li>
                <li><Link to="/hospital/dashboard" className="hover:text-blood-400 transition">Hospital Requisition Center</Link></li>
                <li><Link to="/bank/dashboard" className="hover:text-blood-400 transition">Blood Bank Stock Registry</Link></li>
              </ul>
            </div>

            {/* Emergency & Support */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">24/7 Emergency Support</h4>
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-2 mb-3">
                <p className="text-xs text-gray-400 uppercase font-semibold">National Emergency Toll-Free</p>
                <p className="text-2xl font-black text-blood-400">1800-JEEVAN</p>
                <p className="text-[12px] text-gray-400">Available 24 hours a day, 365 days a year</p>
              </div>
              <p className="text-xs text-gray-400">
                Support: <a href="mailto:help@jeevansh.org" className="text-white hover:underline">help@jeevansh.org</a>
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} Jeevansh Healthcare Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#privacy" className="hover:text-gray-400">Privacy Policy</a>
              <a href="#terms" className="hover:text-gray-400">Medical Disclaimer</a>
              <a href="#contact" className="hover:text-gray-400">Contact Desk</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}