import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';
import { BLOOD_GROUPS } from '../utils/bloodCompat';
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
  MapPinIcon,
  ShieldCheckIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

const ROLES = [
  { id: 'seeker', label: 'Blood Seeker', desc: 'Need emergency blood for self or family', icon: DropletIcon },
  { id: 'donor', label: 'Volunteer Donor', desc: 'Donate blood and save nearby lives', icon: HeartIcon },
  { id: 'hospital', label: 'Hospital Desk', desc: 'Healthcare facility & emergency staff', icon: HospitalIcon },
  { id: 'bank', label: 'Blood Bank', desc: 'Licensed blood center & component bank', icon: BuildingIcon },
];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'seeker';
  const { login } = useAuth();

  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: 'Delhi NCR',
    bloodType: 'O+',
    lastDonatedAt: '',
    institutionName: '',
    licenseNumber: '',
    healthDeclaration: false,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.phone.trim() || form.phone.replace(/[\s-]/g, '').length < 10) errs.phone = 'Valid 10-digit mobile number is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.location.trim()) errs.location = 'City / Location is required';

    if (role === 'donor' && !form.healthDeclaration) {
      errs.healthDeclaration = 'Please acknowledge the basic health declaration';
    }

    if ((role === 'hospital' || role === 'bank') && !form.licenseNumber.trim()) {
      errs.licenseNumber = 'Official registration/license number is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        toast.success('Location coordinates captured!');
      },
      () => toast.error('Could not get GPS location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please resolve the errors highlighted below.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        ...form,
        role,
      });

      if (res.success) {
        login(res.user);
        toast.success(`Account registered as ${role.toUpperCase()}!`);
        // Navigate to role-specific dashboard
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
      }
    } catch {
      toast.error('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blood-600 bg-blood-50 px-3 py-1 rounded-full border border-blood-200">
          Create Your Account
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Join the Jeevansh Network</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          Choose your account type below to get started. All roles contribute to saving lives across India.
        </p>
      </div>

      <Card className="border border-gray-200 p-6 sm:p-10 shadow-lg">
        {/* Role Selection Tabs */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Select Your Role <span className="text-blood-600">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blood-600 bg-blood-50/70 text-blood-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{r.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informational Disclaimer on Institutional Verification */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Transparency Notice</p>
            <p className="text-amber-800 mt-0.5">
              Account registration creates platform access. Clinical donor eligibility and institutional hospital/blood bank accreditation are verified separately per national healthcare protocols.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={role === 'hospital' ? 'Hospital / Clinic Name *' : role === 'bank' ? 'Blood Bank Center Name *' : 'Full Name *'}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />

            <Input
              label="Email Address *"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile / WhatsApp Number *"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City / Location *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Connaught Place, New Delhi"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blood-500 outline-none text-sm text-gray-900"
                />
                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="absolute right-2.5 top-2.5 text-xs font-semibold px-2 py-1 bg-gray-100 rounded-lg text-blood-600 hover:bg-blood-50 flex items-center gap-1"
                >
                  <MapPinIcon className="w-3.5 h-3.5" /> GPS
                </button>
              </div>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Passwords with Show/Hide Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl outline-none text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-200 focus:border-blood-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-3 pr-10 bg-white border-2 rounded-xl outline-none text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-blood-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Role-Specific Fields: DONOR */}
          {role === 'donor' && (
            <div className="p-5 rounded-2xl bg-blood-50/50 border border-blood-100 space-y-4">
              <h4 className="font-bold text-sm text-blood-900 flex items-center gap-2">
                <HeartIcon className="w-4 h-4 text-blood-600" />
                <span>Donor Profile Details</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Blood Group *
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setForm({ ...form, bloodType: bg })}
                      className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                        form.bloodType === bg
                          ? 'bg-blood-600 text-white border-blood-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blood-300'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Donation Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.lastDonatedAt}
                  onChange={(e) => setForm({ ...form, lastDonatedAt: e.target.value })}
                  className="w-full sm:w-1/2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">Leave empty if you are a first-time donor.</p>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.healthDeclaration}
                    onChange={(e) => setForm({ ...form, healthDeclaration: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-blood-600 rounded border-gray-300 focus:ring-blood-500"
                  />
                  <span className="text-xs text-gray-700 leading-relaxed">
                    I declare that I am between 18–65 years old, weigh at least 45 kg, and do not have known transmissible blood infections. I consent to receiving emergency blood alerts.
                  </span>
                </label>
                {errors.healthDeclaration && (
                  <p className="text-red-500 text-xs mt-1">{errors.healthDeclaration}</p>
                )}
              </div>
            </div>
          )}

          {/* Role-Specific Fields: HOSPITAL & BLOOD BANK */}
          {(role === 'hospital' || role === 'bank') && (
            <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
              <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                <BuildingIcon className="w-4 h-4 text-blue-600" />
                <span>{role === 'hospital' ? 'Hospital Regulatory Details' : 'Blood Bank License Details'}</span>
              </h4>

              <Input
                label={role === 'hospital' ? 'Hospital License / Registration No. *' : 'Govt / NACO Blood Center License No. *'}
                placeholder="e.g. LIC-DL-2026-8812"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                error={errors.licenseNumber}
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Institutional Accreditation Document (PDF/Image)
                </label>
                <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center bg-white hover:bg-blue-50/50 cursor-pointer transition">
                  <p className="text-sm font-semibold text-blue-900">Click or drag certificate here</p>
                  <p className="text-xs text-gray-400 mt-1">Supports PDF, PNG, JPG up to 5 MB</p>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? 'Creating Account...' : `Register as ${ROLES.find((r) => r.id === role)?.label}`}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={`/login?role=${role}`} className="text-blood-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </Card>
    </div>
  );
}
