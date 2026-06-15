import { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import Input from '../../components/Input/Input';
import DatePicker from '../../components/DatePicker/DatePicker';
import Card from '../../components/Card/Card';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { id: 'attendance', name: 'Attendance Report', description: 'Employee attendance records' },
    { id: 'visits', name: 'Visit Report', description: 'Customer visit summary' },
    { id: 'sales', name: 'Sales Report', description: 'Sales and revenue analysis' },
    { id: 'expenses', name: 'Expense Report', description: 'Expense breakdown' },
    { id: 'productivity', name: 'Productivity Report', description: 'Employee performance metrics' },
    { id: 'route', name: 'Route Report', description: 'Travel route analysis' },
  ];

  const handleGenerate = () => {
    // TODO: Implement report generation
    console.log('Generating report:', { reportType, dateRange });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and download reports</p>
      </div>

      {/* Report Generator */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select report type</option>
            {reportTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
          <div>
            <label className="label">Date Range</label>
            <div className="flex gap-2">
              <DatePicker
                value={dateRange.start}
                onChange={(value) => setDateRange({ ...dateRange, start: value })}
                placeholder="Start Date"
              />
              <DatePicker
                value={dateRange.end}
                onChange={(value) => setDateRange({ ...dateRange, end: value })}
                placeholder="End Date"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={handleGenerate}>
            <FileText className="h-5 w-5 mr-2" />
            Generate Report
          </Button>
          <Button variant="secondary">
            <Download className="h-5 w-5 mr-2" />
            Export as PDF
          </Button>
          <Button variant="secondary">
            <Download className="h-5 w-5 mr-2" />
            Export as Excel
          </Button>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((type) => (
          <Card key={type.id} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Download className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{type.name}</h4>
            <p className="text-sm text-gray-600">{type.description}</p>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Attendance Report - December 2024</p>
                  <p className="text-sm text-gray-500">Generated on Dec 15, 2024</p>
                </div>
              </div>
              <Button variant="secondary" size="sm">Download</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
