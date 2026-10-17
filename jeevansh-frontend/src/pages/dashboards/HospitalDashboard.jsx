import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import {
  HospitalIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  BuildingIcon,
} from '../../components/common/Icons';
import toast from 'react-hot-toast';

export default function HospitalDashboard() {
  const { user } = useAuth();

  const [requisitions, setRequisitions] = useState([
    {
      id: 'HOSP-9011',
      patientId: 'CASE-4421 (ICU Bed 12)',
      bloodType: 'O-',
      component: 'Packed Red Blood Cells (PRBC)',
      units: 3,
      urgency: 'Emergency (< 2 hrs)',
      status: 'searching',
      alertedDonors: 11,
      createdAt: '15 mins ago',
    },
    {
      id: 'HOSP-8894',
      patientId: 'CASE-3910 (OT 4)',
      bloodType: 'AB+',
      component: 'Single Donor Platelets (SDP)',
      units: 1,
      urgency: 'Critical',
      status: 'donor_found',
      alertedDonors: 16,
      createdAt: '1 hour ago',
    },
    {
      id: 'HOSP-8710',
      patientId: 'CASE-3841 (Ward 3B)',
      bloodType: 'B+',
      component: 'Whole Blood',
      units: 2,
      urgency: 'Standard',
      status: 'completed',
      alertedDonors: 24,
      createdAt: 'Yesterday',
    },
  ]);

  const handleCompleteRequisition = (id) => {
    setRequisitions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'completed' } : r))
    );
    toast.success(`Requisition ${id} marked fulfilled!`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome & Hospital Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-2">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-300" />
            Verified Hospital Emergency Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.name || user?.institutionName || 'AIIMS Super Specialty Hospital'}
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            Clinical requisition desk & voluntary donor coordination terminal.
          </p>
        </div>

        <Link to="/request">
          <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg border-0 shrink-0">
            ➕ New Patient Requisition
          </Button>
        </Link>
      </div>

      {/* Hospital Credentials & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Institutional Details</p>
          <h3 className="font-bold text-gray-900 text-sm">{user?.name || 'Medical Center'}</h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <HospitalIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Lic: {user?.licenseNumber || 'HOSP-DL-2026-9912'}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Desk: +91 11 2658 8500</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Ansari Nagar, New Delhi</span>
          </p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Active Emergency Cases</p>
          <p className="text-3xl font-extrabold text-blood-700 mt-2">
            {requisitions.filter((r) => r.status === 'searching').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Donors actively searching</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Donors Matched</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">
            {requisitions.filter((r) => r.status === 'donor_found').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">En route to hospital</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Units Fulfilled (Month)</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">24</p>
          <p className="text-xs text-gray-400 mt-1">Cross-matched & transfused</p>
        </Card>
      </div>

      {/* Hospital Patient Requisitions Table */}
      <Card className="border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Hospital Patient Requisitions</h3>
            <p className="text-xs text-gray-500">Live feed of patient blood requests dispatched from this center</p>
          </div>
          <div className="flex gap-2">
            <Link to="/request">
              <Button size="sm">
                + Add Patient Requisition
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wider border-y border-gray-200">
              <tr>
                <th className="py-3 px-4">Requisition ID</th>
                <th className="py-3 px-4">Patient Case</th>
                <th className="py-3 px-4">Group & Component</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requisitions.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-800 text-xs">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {req.patientId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 font-bold text-blood-700">
                      <span className="w-6 h-6 rounded-md bg-blood-100 flex items-center justify-center text-xs">
                        {req.bloodType}
                      </span>
                      <span className="text-xs text-gray-700">{req.component}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    {req.units}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-amber-700">
                    {req.urgency}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {req.status === 'donor_found' && (
                      <button
                        onClick={() => handleCompleteRequisition(req.id)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        Confirm Transfusion
                      </button>
                    )}
                    <Link
                      to={`/request/status/${req.id}`}
                      className="text-xs font-semibold text-blood-600 hover:underline"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
