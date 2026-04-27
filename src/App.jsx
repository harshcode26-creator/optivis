import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCheckIns from './pages/AdminCheckIns';
import AdminDashboard from './pages/AdminDashboard';
import CheckInPage from './pages/CheckInPage';
import CreateCheckIn from './pages/CreateCheckIn';
import CreateWorkspace from './pages/CreateWorkspace';
import EmployeeDashboard from './pages/EmployeeDashboard';
import JoinWorkspace from './pages/JoinWorkspace';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ReviewPage from './pages/ReviewPage';
import { getUserFromToken } from './utils/auth';

function DashboardRoute() {
  const user = getUserFromToken();

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <EmployeeDashboard />;
}

function App() {
  const [isColdStarting, setIsColdStarting] = useState(false);

  useEffect(() => {
    const start = () => setIsColdStarting(true);
    const end = () => setIsColdStarting(false);

    window.addEventListener('cold-start', start);
    window.addEventListener('cold-start-resolved', end);

    return () => {
      window.removeEventListener('cold-start', start);
      window.removeEventListener('cold-start-resolved', end);
    };
  }, []);

  return (
    <>
      {isColdStarting && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            background: '#111',
            color: '#fff',
            textAlign: 'center',
            padding: '8px',
            zIndex: 9999,
          }}
        >
          🚀 Waking up server... please wait
        </div>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-workspace" element={<CreateWorkspace />} />
        <Route path="/join" element={<JoinWorkspace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-ins"
          element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-checkin"
          element={
            <ProtectedRoute>
              <Navigate to="/admin/create-checkin" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-checkin"
          element={
            <ProtectedRoute>
              <CreateCheckIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/check-ins"
          element={
            <ProtectedRoute>
              <AdminCheckIns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assignment/:id"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkin/:id"
          element={
            <ProtectedRoute>
              <CheckInPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
