import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your registered email or phone');
      return;
    }
    setSubmitted(true);
    toast.success('Reset link dispatched to your contact');
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <Card className="p-8 border border-gray-200 shadow-lg text-center">
        <span className="text-4xl block mb-3">🔑</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h2>
        <p className="text-xs text-gray-500 mb-6">
          Enter your registered email address or phone number. We'll send instructions to recover your account.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <Input
              label="Registered Email or Mobile"
              placeholder="+91 98765 43210 or user@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <Button type="submit" size="lg" className="w-full">
              Send Password Reset Link
            </Button>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            <p className="font-bold">Instructions Dispatched</p>
            <p className="text-xs mt-1">
              If an account is associated with <strong>{identifier}</strong>, you will receive password reset instructions shortly.
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-xs">
          <Link to="/login" className="text-blood-600 font-bold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
