import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { getDonorDashboard, toggleAvailability, getDonorQR } from '../services/donorService';
import {
  HeartIcon,
  DropletIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../components/common/Icons';
import toast from 'react-hot-toast';

export default function DonorDashboard() {
  const { user, donor } = useAuth();
  const currentDonor = donor || user;
  const [data, setData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [showQR, setShowQR] = useState(false);

  // Incoming Requests State (Interactive accept / decline)
  const [incomingRequests, setIncomingRequests] = useState([
    {
      id: 'REQ-EMERG-441',
      patientName: 'Sunita Sharma (Trauma Ward)',
      hospital: 'AIIMS Trauma Center, New Delhi',
      bloodType: currentDonor?.bloodType || 'B+',
      units: 2,
      distance: 3.2,
      urgency: 'Immediate (< 2 hrs)',
      alertedAt: '8 mins ago',
      status: 'pending',
    },
    {
      id: 'REQ-EMERG-812',
      patientName: 'Devendra Kumar (Surgery OT)',
      hospital: 'Safdarjung Hospital, New Delhi',
      bloodType: currentDonor?.bloodType || 'B+',
      units: 1,
      distance: 5.8,
      urgency: 'Critical',
      alertedAt: '22 mins ago',
      status: 'pending',
    },
  ]);

  useEffect(() => {
    const donorId = currentDonor?.id || 'donor-1';
    getDonorDashboard(donorId).then(setData);
    getDonorQR(donorId).then(setQrData);
  }, [currentDonor]);

  const handleToggle = async () => {
    const current = data?.available ?? data?.is_available ?? true;
    const nextVal = !current;
    try {
      await toggleAvailability(currentDonor?.id || 'donor-1', nextVal);
      setData((prev) => ({ ...prev, available: nextVal, is_available: nextVal }));
      toast.success(nextVal ? 'Active! You will now receive nearby emergency alerts.' : 'Paused. You will not receive emergency alerts.');
    } catch {
      toast.error('Could not update availability');
    }
  };

  const handleAcceptRequest = (reqId) => {
    setIncomingRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' } : r))
    );
    toast.success('Thank you! You have accepted this request. The hospital desk has been notified.');
  };

  const handleDeclineRequest = (reqId) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId));
    toast.error('Request declined. Dispatched to the next available donor.');
  };

  if (!data) return <div className="text-center py-20 text-gray-500">Loading donor portal...</div>;

  const isAvailable = data.available ?? data.is_available ?? true;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blood-800 to-blood-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-red-200 mb-2">
            <HeartIcon className="w-3.5 h-3.5 text-red-300" />
            Volunteer Life Saver
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {currentDonor?.name || 'Hero Donor'} 👋
          </h1>
          <p className="text-red-100 text-sm mt-1">
            Thank you for being on standby to save lives across your neighborhood.
          </p>
        </div>

        <Button onClick={() => setShowQR(!showQR)} variant="secondary" className="bg-white text-blood-800 hover:bg-red-50 border-0 shrink-0">
          {showQR ? 'Hide Check-In QR' : '📷 My Donation Check-In QR'}
        </Button>
      </div>

      {/* Check-In QR Code Card */}
      {showQR && (
        <Card className="bg-gradient-to-r from-red-50 to-amber-50 border-blood-200 text-center animate-fade-in-up">
          <div className="max-w-xs mx-auto p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-48 h-48 mx-auto bg-gray-900 rounded-xl flex items-center justify-center p-3 text-white mb-3">
              <div className="text-center font-mono">
                <span className="text-4xl block mb-1">🩸</span>
                <span className="text-xs break-all px-2 block font-semibold">
                  {qrData?.token || `JEEVANSH:${currentDonor?.id || 'donor-1'}:${currentDonor?.bloodType || 'O+'}`}
                </span>
              </div>
            </div>
            <p className="font-bold text-gray-900">{currentDonor?.name} ({currentDonor?.bloodType || data.bloodType})</p>
            <p className="text-xs text-gray-500 mt-1">
              Present this QR token at any registered blood bank to verify your donation.
            </p>
          </div>
        </Card>
      )}

      {/* Profile Overview & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 border border-gray-200">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Donor Card</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-12 h-12 rounded-2xl bg-blood-600 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
              {currentDonor?.bloodType || data.bloodType || 'O+'}
            </span>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{currentDonor?.name || 'Rahul Sharma'}</h3>
              <p className="text-xs text-gray-500">{currentDonor?.phone || '+91 98765 43210'}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
            <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>{currentDonor?.location || 'Delhi NCR'}</span>
          </p>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-600">Status</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
              {isAvailable ? 'Available' : 'Paused'}
            </span>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Total Donations</p>
          <p className="text-3xl font-extrabold text-blood-700 mt-2">{data.totalDonations}</p>
          <p className="text-xs text-gray-400 mt-1">Verified whole blood units</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Lives Impacted</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{data.livesImpacted}</p>
          <p className="text-xs text-gray-400 mt-1">Calculated impact metrics</p>
        </Card>

        <Card className="border border-gray-200">
          <p className="text-xs font-medium text-gray-500">Next Eligible</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">
            {data.nextEligibleDays !== undefined ? data.nextEligibleDays : 0} <span className="text-sm font-semibold">days</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">90-day cooldown interval</p>
        </Card>
      </div>

      {/* Availability Toggle and Medical Screening Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2">⚡ Availability Preference</h3>
          <p className="text-xs text-gray-500 mb-4">
            Toggle your availability to start or pause receiving nearby emergency dispatch requests.
          </p>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-semibold text-sm text-gray-800">
                {isAvailable ? 'Currently Receiving Emergency Alerts' : 'Alerts Paused'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {isAvailable ? 'Active in regional 15 km radar' : 'Hidden from emergency search'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer ${
                isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  isAvailable ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </Card>

        <Card className="border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
            <span>Medical Eligibility Notice</span>
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            Medical eligibility requires appropriate in-person screening at the donation center prior to transfusion.
          </p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <p>✓ Minimum Hemoglobin: 12.5 g/dL</p>
            <p>✓ Safe blood pressure & pulse check</p>
            <p>✓ No alcohol intake in the previous 24 hours</p>
          </div>
        </Card>
      </div>

      {/* Incoming Emergency Requests Feed */}
      <Card className="border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Incoming Emergency Blood Requests</h3>
            <p className="text-xs text-gray-500">Patients in nearby hospitals needing your compatible blood group</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-red-100 text-blood-700 rounded-full">
            {incomingRequests.filter((r) => r.status === 'pending').length} Pending
          </span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No incoming requests at this moment. You will be alerted when a nearby hospital requests your blood group.
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border transition-all ${
                  req.status === 'accepted'
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-white border-gray-200 hover:border-blood-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                      {req.bloodType}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-sm">{req.patientName}</h4>
                        <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        🏥 {req.hospital} • 📍 {req.distance} km away
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2"
                        >
                          ✓ Accept & Coordinate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeclineRequest(req.id)}
                          className="text-xs text-gray-500 hover:text-red-600"
                        >
                          Decline
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Accepted • Hospital Alerted</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}