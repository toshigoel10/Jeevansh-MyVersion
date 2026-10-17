import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  DropletIcon,
  HeartIcon,
  HospitalIcon,
  BuildingIcon,
  EyeIcon,
  EyeOffIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'seeker', label: 'Blood Seeker', icon: DropletIcon, demoId: '+919876543210' },
  { id: 'donor', label: 'Volunteer Donor', icon: HeartIcon, demoId: '+919810000000' },
  { id: 'hospital', label: 'Hospital Desk', icon: HospitalIcon, demoId: 'aiims@delhi.gov.in' },
  { id: 'bank', label: 'Blood Bank', icon: BuildingIcon, demoId: 'bank-1' },
];

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'donor';
  const { login } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleQuickDemo = (demoRole) => {
    const selected = ROLES.find((r) => r.id === demoRole);
    if (selected) {
      setRole(selected.id);
      setIdentifier(selected.demoId);
      setPassword('password123');
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered email or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginUser({ identifier, password, role });
      if (res.success) {
        login(res.user);
        toast.success(`Welcome back, ${res.user.name}!`);

        switch (role) {
          case 'donor':
            navigate('/donor/dashboard');
            break;
          case 'bank':
            navigate('/bank/dashboard');
            break;
          case 'hospital':
            navigate('/hospital/dashboard');
            break;
          case 'seeker':
          default:
            navigate('/seeker/dashboard');
            break;
        }
      } else {
        setError('Invalid credentials. Please verify and try again.');
      }
    } catch {
      setError('Could not connect to authentication service. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8 space-y-2">
        <span className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md shadow-blood-600/30">
          🩸
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Sign In to Jeevansh</h1>
        <p className="text-gray-500 text-sm">Access your coordination portal</p>
      </div>

      <Card className="border border-gray-200 p-6 sm:p-8 shadow-lg">
        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            Select Portal Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blood-50 border-blood-600 text-blood-800 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blood-600' : 'text-gray-400'}`} />
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={role === 'bank' ? 'Bank ID or Phone *' : 'Email Address or Mobile Number *'}
            placeholder={role === 'bank' ? 'e.g. BANK-001 or +9198...' : 'e.g. +91 98765 43210 or user@example.com'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <Link to="/forgot-password" className="text-xs text-blood-600 font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl focus:border-blood-500 outline-none text-sm text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
            {loading ? 'Authenticating...' : `Sign In as ${ROLES.find((r) => r.id === role)?.label}`}
          </Button>
        </form>

        {/* Demo Fast Logins for reviewers */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 text-center">
            Demo Quick Access (One-Click)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.id}
                onClick={() => handleQuickDemo(r.id)}
                className="py-1.5 px-2 bg-gray-50 hover:bg-blood-50 border border-gray-200 hover:border-blood-300 rounded-lg text-[11px] font-semibold text-gray-700 hover:text-blood-800 text-center transition"
              >
                Demo {r.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to={`/register?role=${role}`} className="text-blood-600 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
}
