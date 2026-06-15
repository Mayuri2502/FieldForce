import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, MapPin, Clock, MoreVertical } from 'lucide-react';
import VisitForm from './VisitForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Visits = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['visits', { search, status }],
    queryFn: () =>
      api.get('/visits', { params: { search, status } }).then((res) => res.data.data.visits),
  });

  const handleCreateVisit = () => {
    setSelectedVisit(null);
    setIsModalOpen(true);
  };

  const handleEditVisit = (visit) => {
    setSelectedVisit(visit);
    setIsModalOpen(true);
  };

  const handleDeleteVisit = (visit) => {
    setVisitToDelete(visit);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/visits/${visitToDelete.id}`);
      queryClient.invalidateQueries(['visits']);
      setDeleteModalOpen(false);
      setVisitToDelete(null);
    } catch (error) {
      console.error('Failed to delete visit:', error);
    }
  };

  const handleSubmitVisit = async (data) => {
    try {
      if (selectedVisit) {
        await api.put(`/visits/${selectedVisit.id}`, data);
      } else {
        await api.post('/visits', data);
      }
      queryClient.invalidateQueries(['visits']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save visit:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'scheduled':
        return 'primary';
      case 'missed':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-gray-600">Track customer visits</p>
        </div>
        <Button onClick={handleCreateVisit}>
          <Plus className="h-5 w-5 mr-2" />
          Schedule Visit
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search visits..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : visits?.length === 0 ? (
          <EmptyState
            icon="fileText"
            title="No visits found"
            description="Get started by scheduling your first visit"
            action={handleCreateVisit}
            actionText="Schedule Visit"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'customer',
                label: 'Customer',
                render: (_, row) => (
                  <p className="font-medium text-gray-900">{row.customer?.name || 'N/A'}</p>
                ),
              },
              {
                key: 'type',
                label: 'Type',
                render: (value) => <span className="capitalize text-gray-600">{value?.replace('_', ' ')}</span>,
              },
              {
                key: 'scheduled_date',
                label: 'Scheduled Date',
                format: 'datetime',
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => <Badge variant={getStatusColor(value)}>{value?.replace('_', ' ')}</Badge>,
              },
              {
                key: 'duration_minutes',
                label: 'Duration',
                render: (value) => (value ? `${value} min` : '-'),
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
                    <DropdownItem onClick={() => handleEditVisit(row)}>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteVisit(row)}>Delete</DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={visits}
          />
        )}
      </div>

      {/* Visit Form Modal */}
      <VisitForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitVisit}
        initialData={selectedVisit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Visit"
        message="Are you sure you want to delete this visit? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Visits;
