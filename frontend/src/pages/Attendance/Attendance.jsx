import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Avatar from '../../components/Avatar/Avatar';

const Attendance = () => {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('');

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', { date, status }],
    queryFn: () =>
      api.get('/attendance', { params: { date, status } }).then((res) => res.data.data.attendance),
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'danger';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Track employee attendance</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : attendance?.length === 0 ? (
          <EmptyState
            icon="fileText"
            title="No attendance records found"
            description="Select a different date to view attendance records"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'employee',
                label: 'Employee',
                render: (_, row) => (
                  <div className="flex items-center">
                    <Avatar
                      initials={`${row.employee?.first_name?.[0] || ''}${row.employee?.last_name?.[0] || ''}`}
                      alt={`${row.employee?.first_name} ${row.employee?.last_name}`}
                      className="mr-3"
                    />
                    <p className="font-medium text-gray-900">
                      {row.employee?.first_name} {row.employee?.last_name}
                    </p>
                  </div>
                ),
              },
              {
                key: 'check_in_time',
                label: 'Check In',
                render: (value) => (value ? new Date(value).toLocaleTimeString() : '-'),
              },
              {
                key: 'check_out_time',
                label: 'Check Out',
                render: (value) => (value ? new Date(value).toLocaleTimeString() : '-'),
              },
              {
                key: 'work_hours',
                label: 'Work Hours',
                render: (value) => (value ? `${value.toFixed(2)}h` : '-'),
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => (
                  <div className="flex items-center">
                    {getStatusIcon(value)}
                    <Badge variant={getStatusColor(value)} className="ml-2">
                      {value}
                    </Badge>
                  </div>
                ),
              },
            ]}
            data={attendance}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
