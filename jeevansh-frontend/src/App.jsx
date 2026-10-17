import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';

import RequesterLayout from './components/layout/RequesterLayout';

// Public & Flow Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import RequestForm from './pages/RequestForm';
import BanksScreen from './pages/BanksScreen';
import AlertingScreen from './pages/AlertingScreen';
import StatusScreen from './pages/StatusScreen';
import BankScan from './pages/BankScan';

// Role-Based Dashboards
import SeekerDashboard from './pages/dashboards/SeekerDashboard';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/dashboards/HospitalDashboard';
import BankDashboard from './pages/BankDashboard';

function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={`/login?role=${role || 'seeker'}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '14px',
                fontSize: '13px',
                fontWeight: '500',
              },
            }}
          />
          <Routes>
            <Route element={<RequesterLayout />}>
              {/* Core Landing & Authentication */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Backward compatibility routes */}
              <Route path="/donor/login" element={<Navigate to="/login?role=donor" replace />} />
              <Route path="/donor/register" element={<Navigate to="/register?role=donor" replace />} />
              <Route path="/bank/login" element={<Navigate to="/login?role=bank" replace />} />

              {/* Blood Requisition Flow */}
              <Route path="/request" element={<RequestForm />} />
              <Route path="/request/banks" element={<BanksScreen />} />
              <Route path="/request/alerting" element={<AlertingScreen />} />
              <Route path="/request/status/:id" element={<StatusScreen />} />

              {/* Role-Based Dashboards */}
              <Route
                path="/seeker/dashboard"
                element={
                  <ProtectedRoute role="seeker">
                    <SeekerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute role="donor">
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hospital/dashboard"
                element={
                  <ProtectedRoute role="hospital">
                    <HospitalDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bank/dashboard"
                element={
                  <ProtectedRoute role="bank">
                    <BankDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bank/scan"
                element={
                  <ProtectedRoute role="bank">
                    <BankScan />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RequestProvider>
    </AuthProvider>
  );
}