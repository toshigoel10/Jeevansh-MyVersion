import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { BLOOD_GROUPS } from '../utils/bloodCompat';
import { useRequest } from '../context/RequestContext';
import { checkBanks } from '../services/requestService';
import toast from 'react-hot-toast';

export default function RequestForm() {
  const navigate = useNavigate();
  const { setActiveRequest } = useRequest();
  const [form, setForm] = useState({
    bloodType: '',
    location: '',
    latitude: 28.6139,
    longitude: 77.2090,
    patientAge: '',
    patientGender: '',
    units: 1,
    hospital: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bloodType || !form.location) return toast.error('Blood group and location are required');
    setLoading(true);
    try {
      const banks = await checkBanks(form.bloodType, form.latitude, form.longitude);
      const banksWithStock = banks.filter((b) => b.hasStock);
      setActiveRequest({ ...form, banks: banksWithStock });
      setLoading(false);
      if (banksWithStock.length > 0) navigate('/request/banks');
      else navigate('/request/alerting');
    } catch {
      setLoading(false);
      toast.error('Failed to search blood banks. Please try again.');
    }

  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        toast.success('GPS Location detected!');
      },
      () => toast.error('Could not get location')
    );
  };


  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Blood</h1>
        <p className="text-gray-500">Fill in the details below. We'll alert compatible donors near you instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Blood Group Needed <span className="text-blood-600">*</span></label>
          <div className="grid grid-cols-4 gap-3">
            {BLOOD_GROUPS.map((bg) => (
              <button type="button" key={bg} onClick={() => setForm({ ...form, bloodType: bg })}
                className={`py-3 rounded-xl font-bold border-2 transition-all ${form.bloodType === bg ? 'bg-blood-600 text-white border-blood-600 shadow-lg shadow-blood-600/20' : 'bg-white text-gray-700 border-gray-200 hover:border-blood-300'}`}>
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Input label="Location *" placeholder="Enter your city or area" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button type="button" onClick={useMyLocation} className="text-blood-600 text-sm font-medium hover:underline flex items-center gap-1">
            📍 Use my current location
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Patient Age" type="number" value={form.patientAge} onChange={(e) => setForm({ ...form, patientAge: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blood-500/20 focus:border-blood-500 outline-none" value={form.patientGender} onChange={(e) => setForm({ ...form, patientGender: e.target.value })}>
              <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Input label="Units Needed" type="number" min="1" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
          <Input label="Hospital Name" placeholder="e.g. City Hospital" value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} />
        </div>

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Searching for donors...' : '🚨 Alert Nearby Donors'}
        </Button>
      </form>
    </div>
  );
}