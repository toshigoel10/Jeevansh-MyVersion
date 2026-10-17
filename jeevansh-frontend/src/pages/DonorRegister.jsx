import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { BLOOD_GROUPS } from '../utils/bloodCompat';
import { registerDonor } from '../services/donorService';
import toast from 'react-hot-toast';

export default function DonorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bloodType: '',
    location: 'Delhi NCR',
    latitude: 28.6139,
    longitude: 77.2090,
  });
  const [loading, setLoading] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        toast.success('GPS coordinates captured for nearby alerts!');
      },
      () => toast.error('Could not get GPS location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.bloodType) return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      await registerDonor(form);
      setLoading(false);
      toast.success('Registered! Welcome to Jeevansh.');
      navigate('/donor/login');
    } catch {
      setLoading(false);
      toast.error('Registration failed. Please check your phone number.');
    }

  };


  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Donor</h1>
        <p className="text-gray-500">Join 12,000+ heroes who save lives every day.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="WhatsApp Number *" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Blood Type *</label>
          <div className="grid grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((bg) => (
              <button type="button" key={bg} onClick={() => setForm({ ...form, bloodType: bg })}
                className={`py-3 rounded-xl font-bold border-2 transition-all ${form.bloodType === bg ? 'bg-blood-600 text-white border-blood-600' : 'bg-white border-gray-200 hover:border-blood-300'}`}>
                {bg}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <Input label="Location" placeholder="City or area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button type="button" onClick={detectLocation} className="text-blood-600 text-sm font-medium hover:underline flex items-center gap-1 mt-1">
            📍 Use my GPS location
          </button>
        </div>

        <Button type="submit" size="lg" disabled={loading}>{loading ? 'Registering...' : 'Register as Donor'}</Button>

      </form>
      <p className="text-center mt-6 text-sm text-gray-500">
        Already registered? <Link to="/donor/login" className="text-blood-600 font-semibold hover:underline">Login here</Link>
      </p>
    </div>
  );
}