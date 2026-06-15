import { useState, useEffect } from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import socketService from '../../services/socket';

const Tracking = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', status: 'online', lastUpdate: '2 min ago' },
    { id: 2, name: 'Jane Smith', status: 'online', lastUpdate: '5 min ago' },
    { id: 3, name: 'Bob Johnson', status: 'offline', lastUpdate: '1 hour ago' },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);

    // Listen for location updates
    socketService.on('employee-location', (data) => {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === data.employeeId
            ? { ...emp, lastUpdate: 'Just now', status: 'online' }
            : emp
        )
      );
    });

    return () => {
      socketService.off('employee-location');
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
          <p className="text-gray-600">Real-time GPS tracking of field employees</p>
        </div>
        <Button>
          <RefreshCw className="h-5 w-5 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Map Container */}
      <div className="card p-0 overflow-hidden">
        <div className="h-[600px] bg-gray-100 flex items-center justify-center relative">
          {loading ? (
            <Loading />
          ) : (
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Interactive Map</p>
              <p className="text-gray-400 text-sm mt-2">
                Google Maps integration will be rendered here
              </p>
              <p className="text-gray-400 text-sm">
                Configure GOOGLE_MAPS_API_KEY in backend .env
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Employee List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Employees</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">Last updated: 2 min ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Online</Badge>
                <Button variant="secondary" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  View Route
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
