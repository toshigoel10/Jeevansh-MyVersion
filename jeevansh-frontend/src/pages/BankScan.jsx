import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { verifyDonation } from '../services/bankService';
import toast from 'react-hot-toast';

export default function BankScan() {
  const [scanned, setScanned] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const startScan = async () => {
    setScanning(true);
    const scanner = new Html5Qrcode(containerRef.current.id);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          const result = await verifyDonation(decodedText);
          setScanned(result);
          toast.success('Donation verified!');
        },
        () => {}
      );
    } catch {
      toast.error('Camera access denied');
      setScanning(false);
    }

  };

  const simulateScan = async () => {
    const result = await verifyDonation('SIMULATED_TOKEN');
    setScanned(result);
    toast.success('Donation verified!');
  };

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}); }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-gray-500 mt-1">Scan the donor's QR code to verify their donation.</p>
      </div>

      {!scanned && (
        <Card>
          <div id="qr-reader" ref={containerRef} className="w-full rounded-xl overflow-hidden mb-4" />
          {!scanning && (
            <div className="space-y-3">
              <Button size="lg" onClick={startScan}>📷 Start Camera Scan</Button>
              <Button variant="secondary" size="lg" onClick={simulateScan}>
                ⚡ Simulate Scan (Demo Mode)
              </Button>
            </div>
          )}
          {scanning && (
            <p className="text-center text-sm text-gray-500 animate-pulse">Scanning... point camera at QR code</p>
          )}
        </Card>
      )}

      {scanned && (
        <Card className="bg-emerald-50 border-emerald-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h3 className="text-2xl font-bold text-emerald-800 mb-4">Donation Verified</h3>
            <div className="bg-white rounded-xl p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Donor</p><p className="font-semibold">{scanned.donorName}</p></div>
                <div><p className="text-xs text-gray-500">Blood Type</p><p className="font-semibold">{scanned.bloodType}</p></div>
                <div><p className="text-xs text-gray-500">Request ID</p><p className="font-semibold">{scanned.requestId}</p></div>
                <div><p className="text-xs text-gray-500">Time</p><p className="font-semibold">{new Date().toLocaleTimeString()}</p></div>
              </div>
            </div>
            <Button onClick={() => setScanned(null)}>Scan Next Donor</Button>
          </div>
        </Card>
      )}
    </div>
  );
}