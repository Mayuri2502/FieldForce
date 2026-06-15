import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Tasks from './pages/Tasks/Tasks';
import Customers from './pages/Customers/Customers';
import Visits from './pages/Visits/Visits';
import Orders from './pages/Orders/Orders';
import Products from './pages/Products/Products';
import Expenses from './pages/Expenses/Expenses';
import Leaves from './pages/Leaves/Leaves';
import Attendance from './pages/Attendance/Attendance';
import Tracking from './pages/Tracking/Tracking';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Notifications from './pages/Notifications/Notifications';
import socketService from './services/socket';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      socketService.connect();
      socketService.joinCompany(user.company_id);
      socketService.joinUser(user.id);

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="customers" element={<Customers />} />
          <Route path="visits" element={<Visits />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
