import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
}

function App() {
  return (
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
            <CreateCheckIn />
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
  );
}

export default App;
