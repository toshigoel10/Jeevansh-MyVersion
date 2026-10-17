import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import {
  DropletIcon,
  SearchIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../../components/common/Icons';
import toast from 'react-hot-toast';

export default function SeekerDashboard() {
  const { user } = useAuth();

  const [activeRequests, setActiveRequests] = useState([
    {
      id: 'REQ-882103',
      patientName: 'Kavita Verma',
      bloodType: 'B+',
      units: 2,
      hospital: 'AIIMS Super Specialty, New Delhi',
      urgency: 'Emergency (< 2 hrs)',
      status: 'searching',
      alertedDonors: 14,
      createdAt: '25 mins ago',
    },
    {
      id: 'REQ-761922',
      patientName: 'Ramesh Chander',
      bloodType: 'O+',
      units: 1,
      hospital: 'City Hospital, Connaught Place',
      urgency: 'Standard',
      status: 'completed',
      alertedDonors: 19,
      createdAt: 'Yesterday',
    },
  ]);

  const handleCancelRequest = (reqId) => {
    setActiveRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'cancelled' } : r))
    );
    toast.success(`Request ${reqId} cancelled`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blood-800 to-blood-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-red-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active Seeker Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name || 'Blood Seeker'} 👋
          </h1>
          <p className="text-red-100 text-sm mt-1">
            Emergency coordination hub for your patient blood requests.
          </p>
        </div>

        <Link to="/request">
          <Button size="lg" className="bg-white text-blood-700 hover:bg-red-50 shadow-lg border-0 shrink-0">
            🚨 Create Emergency Request
          </Button>
        </Link>
      </div>

      {/* Profile Overview & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seeker Profile</p>
          <h3 className="font-bold text-gray-900 text-base">{user?.name || 'Patient Family'}</h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{user?.phone || '+91 98765 43210'}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{user?.location || 'Delhi NCR'}</span>
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Verified Seeker Account
            </span>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Active Requests</p>
          <p className="text-3xl font-extrabold text-blood-700 mt-2">
            {activeRequests.filter((r) => r.status === 'searching').length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Broadcasting to nearby donors</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Fulfilled Units</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">1</p>
          <p className="text-xs text-gray-400 mt-1">Units received to date</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Fastest Match</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">18 <span className="text-sm font-semibold">mins</span></p>
          <p className="text-xs text-gray-400 mt-1">Average response time</p>
        </Card>
      </div>

      {/* Active Blood Requests List */}
      <Card className="border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">My Emergency Blood Requisitions</h3>
            <p className="text-xs text-gray-500">Track matched donors and fulfillment status in real time</p>
          </div>
          <Link to="/request" className="text-xs font-bold text-blood-600 hover:underline">
            + New Request
          </Link>
        </div>

        <div className="space-y-4">
          {activeRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-gray-200 hover:border-blood-200 bg-white transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blood-50 border border-blood-200 text-blood-700 flex items-center justify-center font-black text-lg">
                    {req.bloodType}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">{req.patientName}</span>
                      <span className="text-xs font-mono text-gray-400 font-semibold">{req.id}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      🏥 {req.hospital} • {req.units} unit(s) needed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status} />
                  <Link to={`/request/status/${req.id}`}>
                    <Button variant="secondary" size="sm">
                      Track Live
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 gap-2">
                <div className="flex items-center gap-4">
                  <span>Urgency: <strong className="text-gray-800">{req.urgency}</strong></span>
                  <span>Alerted Donors: <strong className="text-blood-700">{req.alertedDonors} nearby</strong></span>
                  <span>Created: {req.createdAt}</span>
                </div>

                {req.status === 'searching' && (
                  <button
                    onClick={() => handleCancelRequest(req.id)}
                    className="text-gray-400 hover:text-red-500 font-medium"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Guidance & Contacts Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-red-50/50 border border-red-200">
          <h4 className="font-bold text-blood-900 text-sm mb-2 flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-blood-600" />
            <span>Need Immediate Assistance?</span>
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            If this is a critical life-threatening trauma case, please call our 24/7 centralized dispatch team immediately alongside submitting a web alert.
          </p>
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-200">
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Toll-Free Emergency Helpline</p>
              <p className="text-lg font-black text-blood-700">1800-JEEVAN</p>
            </div>
            <a href="tel:1800-JEEVAN">
              <Button size="sm">Call Now</Button>
            </a>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            <span>Guidelines for Blood Seekers</span>
          </h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>• Ensure patient's cross-matching sample is already submitted to the hospital laboratory.</li>
            <li>• Voluntary donors never charge money. All blood donations through Jeevansh are non-commercial.</li>
            <li>• Provide the confirmed donor with the hospital room/bed number and patient name.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
