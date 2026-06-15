import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, Calendar, MoreVertical } from 'lucide-react';
import LeaveForm from './LeaveForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Leaves = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', { search, status }],
    queryFn: () =>
      api.get('/leaves', { params: { search, status } }).then((res) => res.data.data.leaves),
  });

  const handleCreateLeave = () => {
    setSelectedLeave(null);
    setIsModalOpen(true);
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleDeleteLeave = (leave) => {
    setLeaveToDelete(leave);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/leaves/${leaveToDelete.id}`);
      queryClient.invalidateQueries(['leaves']);
      setDeleteModalOpen(false);
      setLeaveToDelete(null);
    } catch (error) {
      console.error('Failed to delete leave:', error);
    }
  };

  const handleSubmitLeave = async (data) => {
    try {
      if (selectedLeave) {
        await api.put(`/leaves/${selectedLeave.id}`, data);
      } else {
        await api.post('/leaves', data);
      }
      queryClient.invalidateQueries(['leaves']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save leave:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage leave requests</p>
        </div>
        <Button onClick={handleCreateLeave}>
          <Plus className="h-5 w-5 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leaves..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : leaves?.length === 0 ? (
          <EmptyState
            icon="fileText"
            title="No leave requests found"
            description="Get started by applying for leave"
            action={handleCreateLeave}
            actionText="Apply for Leave"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'employee',
                label: 'Employee',
                render: (_, row) => (
                  <p className="font-medium text-gray-900">
                    {row.employee?.first_name} {row.employee?.last_name}
                  </p>
                ),
              },
              {
                key: 'leave_type',
                label: 'Type',
                render: (value) => <span className="capitalize text-gray-600">{value?.replace('_', ' ')}</span>,
              },
              {
                key: 'date_range',
                label: 'Date Range',
                render: (_, row) => (
                  <span className="text-gray-600">
                    {new Date(row.start_date).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: 'total_days',
                label: 'Days',
                render: (value) => <span className="text-gray-600">{value}</span>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => <Badge variant={getStatusColor(value)}>{value}</Badge>,
              },
              {
                key: 'actions',
                label: '',
                render: (_, row) => (
                  <Dropdown
                    trigger={
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => handleEditLeave(row)}>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteLeave(row)}>Delete</DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={leaves}
          />
        )}
      </div>

      {/* Leave Form Modal */}
      <LeaveForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitLeave}
        initialData={selectedLeave}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Leaves;
