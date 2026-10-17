import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { getRequestStatus } from '../services/requestService';

export default function StatusScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const poll = async () => {
      const s = await getRequestStatus(id);
      setStatus(s);
      if (s.status === 'donor_found') return;
      setTimeout(poll, 5000);
    };
    poll();
  }, [id]);

  const steps = ['searching', 'donor_found', 'confirmed', 'completed'];
  const currentIdx = steps.indexOf(status?.status || 'searching');

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Request {id}</h2>
          <StatusBadge status={status?.status} />
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                i <= currentIdx ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {i <= currentIdx ? '✓' : i + 1}
              </div>
              <div>
                <p className={`font-semibold ${i <= currentIdx ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                {i === currentIdx && <p className="text-xs text-blood-600 font-medium">In progress...</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {status?.acceptedDonor && (
        <Card className="bg-emerald-50 border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-800 mb-4">🎉 Donor Found!</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><p className="text-xs text-gray-500">Name</p><p className="font-semibold">{status.acceptedDonor.name}</p></div>
            <div><p className="text-xs text-gray-500">Distance</p><p className="font-semibold">{status.acceptedDonor.distance ?? status.acceptedDonor.distance_km ?? 2.4} km</p></div>
          </div>

          <a href={`tel:${status.acceptedDonor.phone}`}>
            <Button className="w-full">📞 Call Donor — {status.acceptedDonor.phone}</Button>
          </a>
        </Card>
      )}

      <Button variant="secondary" size="lg" onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );
}