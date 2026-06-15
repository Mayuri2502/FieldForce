import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Users,
  CheckSquare,
  MapPin,
  ShoppingCart,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import CustomLineChart from '../../components/Charts/LineChart';
import CustomBarChart from '../../components/Charts/BarChart';

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then((res) => res.data.data.stats),
  });

  const { data: attendanceTrend } = useQuery({
    queryKey: ['attendance-trend'],
    queryFn: () => api.get('/dashboard/attendance-trend').then((res) => res.data.data.attendance_trend),
  });

  const { data: salesTrend } = useQuery({
    queryKey: ['sales-trend'],
    queryFn: () => api.get('/dashboard/sales-trend').then((res) => res.data.data.sales_trend),
  });

  const { data: topPerformers } = useQuery({
    queryKey: ['top-performers'],
    queryFn: () => api.get('/dashboard/top-performers').then((res) => res.data.data.top_performers),
  });

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.total_employees || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Present Today',
      value: stats?.present_employees || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Tasks Completed',
      value: stats?.completed_tasks || 0,
      icon: CheckSquare,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Visits Completed',
      value: stats?.completed_visits || 0,
      icon: MapPin,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Orders Today',
      value: stats?.orders_today || 0,
      icon: ShoppingCart,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers || 0,
      icon: Building2,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Revenue Today',
      value: `$${stats?.revenue_today?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Trend (7 Days)</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            {attendanceTrend && attendanceTrend.length > 0 ? (
              <CustomLineChart
                data={attendanceTrend.map(item => ({
                  date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  present: item.present || 0,
                  absent: item.absent || 0,
                  late: item.late || 0,
                }))}
                dataKey="present"
                xAxisKey="date"
                color="#10b981"
                name="Present"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No attendance data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend (30 Days)</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            {salesTrend && salesTrend.length > 0 ? (
              <CustomBarChart
                data={salesTrend.map(item => ({
                  date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  revenue: parseFloat(item.revenue || 0),
                  orders: item.orders || 0,
                }))}
                dataKey="revenue"
                xAxisKey="date"
                color="#3b82f6"
                name="Revenue"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No sales data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers (30 Days)</h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Visits</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers?.map((performer) => (
                <tr key={performer.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">
                      {performer.first_name} {performer.last_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{performer.visits_count || 0}</td>
                  <td className="py-3 px-4 text-gray-600">
                    ${parseFloat(performer.revenue || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
