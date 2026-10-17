import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import {
  BuildingIcon,
  ShieldCheckIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function BankDashboard() {
  const { bank, user } = useAuth();
  const currentBank = bank || user;

  const [stockLevels, setStockLevels] = useState([
    { group: 'O+', units: 32, status: 'Adequate', color: 'bg-emerald-500' },
    { group: 'O-', units: 4, status: 'Low', color: 'bg-red-500' },
    { group: 'A+', units: 24, status: 'Adequate', color: 'bg-emerald-500' },
    { group: 'A-', units: 6, status: 'Low', color: 'bg-red-500' },
    { group: 'B+', units: 18, status: 'Moderate', color: 'bg-emerald-500' },
    { group: 'B-', units: 11, status: 'Moderate', color: 'bg-amber-500' },
    { group: 'AB+', units: 9, status: 'Moderate', color: 'bg-amber-500' },
    { group: 'AB-', units: 2, status: 'Critical', color: 'bg-red-500' },
  ]);

  const [recentDonations, setRecentDonations] = useState([
    { name: 'Rahul S.', blood: 'B+', time: '10:42 AM', status: 'Verified' },
    { name: 'Priya M.', blood: 'O+', time: '10:15 AM', status: 'Verified' },
    { name: 'Amit K.', blood: 'A+', time: '9:50 AM', status: 'Pending' },
  ]);

  const handleAdjustStock = (group, delta) => {
    setStockLevels((prev) =>
      prev.map((s) => {
        if (s.group === group) {
          const newUnits = Math.max(0, s.units + delta);
          return {
            ...s,
            units: newUnits,
            status: newUnits < 5 ? 'Critical' : newUnits < 15 ? 'Moderate' : 'Adequate',
            color: newUnits < 5 ? 'bg-red-500' : newUnits < 15 ? 'bg-amber-500' : 'bg-emerald-500',
          };
        }
        return s;
      })
    );
    toast.success(`Inventory for ${group} updated`);
  };

  const totalUnits = stockLevels.reduce((acc, curr) => acc + curr.units, 0);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blood-800 to-blood-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-red-200 mb-2">
            <BuildingIcon className="w-3.5 h-3.5 text-red-300" />
            Accredited Blood Center Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {currentBank?.name || currentBank?.institutionName || 'City Hospital Blood Bank'}
          </h1>
          <p className="text-red-100 text-sm mt-1">
            Real-time blood stock management & donor check-in terminal.
          </p>
        </div>

        <Link to="/bank/scan">
          <Button size="lg" className="bg-white text-blood-800 hover:bg-red-50 shadow-lg border-0 shrink-0">
            📷 Scan Donor QR Code
          </Button>
        </Link>
      </div>

      {/* Bank Credentials & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Blood Center Profile</p>
          <h3 className="font-bold text-gray-900 text-sm">{currentBank?.name || 'City Blood Center'}</h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lic: {currentBank?.licenseNumber || 'NACO-DL-0012'}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Desk: +91 11 2345 6789</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Connaught Place, New Delhi</span>
          </p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Total Blood Stock</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{totalUnits}</p>
          <p className="text-xs text-gray-400 mt-1">Available tested units</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Today's Collections</p>
          <p className="text-3xl font-extrabold text-blood-700 mt-2">{recentDonations.length}</p>
          <p className="text-xs text-gray-400 mt-1">Verified check-ins</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Critical Shortages</p>
          <p className="text-3xl font-extrabold text-red-600 mt-2">
            {stockLevels.filter((s) => s.units < 5).length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Groups needing donor drives</p>
        </Card>
      </div>

      {/* Stock Management Matrix */}
      <Card className="border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Blood Stock Inventory Matrix</h3>
            <p className="text-xs text-gray-500">Current tested units available across all ABO/Rh blood groups</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
            Last Synced: Just now
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stockLevels.map((s) => (
            <div key={s.group} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-lg text-gray-900">{s.group}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  s.units < 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {s.status}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-800">{s.units} <span className="text-xs font-normal text-gray-500">units</span></p>
              <div className={`w-full h-1.5 rounded-full ${s.color}`} />
              
              {/* Quick Adjustment Controls */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleAdjustStock(s.group, -1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 text-xs"
                  title="Issue Unit"
                >
                  -
                </button>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Stock</span>
                <button
                  onClick={() => handleAdjustStock(s.group, 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 text-xs"
                  title="Add Unit"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Donations & Donor Check-Ins */}
      <Card className="border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Today's Verified Donor Check-Ins</h3>
            <p className="text-xs text-gray-500">Donors who arrived and verified their check-in QR code</p>
          </div>
          <Link to="/bank/scan">
            <Button size="sm">
              📷 Open QR Scanner
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {recentDonations.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blood-100 rounded-xl flex items-center justify-center font-bold text-blood-700 text-sm">
                  {d.blood}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.time}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                d.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}