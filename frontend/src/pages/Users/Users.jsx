import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2 } from 'lucide-react';
import UserForm from './UserForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import Avatar from '../../components/Avatar/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Users = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', { search, role }],
    queryFn: () => api.get('/users', { params: { search, role } }).then((res) => res.data.data.users),
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${userToDelete.id}`);
      queryClient.invalidateQueries(['users']);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSubmitUser = async (data) => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, data);
      } else {
        await api.post('/users', data);
      }
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="h-5 w-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Roles</option>
            <option value="employee">Employees</option>
            <option value="manager">Managers</option>
            <option value="company_admin">Company Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : users?.length === 0 ? (
          <EmptyState
            icon="users"
            title="No users found"
            description="Get started by adding your first team member"
            action={handleCreateUser}
            actionText="Add User"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'User',
                sortable: true,
                render: (_, row) => (
                  <div className="flex items-center">
                    <Avatar
                      initials={`${row.first_name?.[0] || ''}${row.last_name?.[0] || ''}`}
                      alt={`${row.first_name} ${row.last_name}`}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {row.first_name} {row.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{row.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                label: 'Role',
                render: (value) => <Badge variant="info">{value?.replace('_', ' ')}</Badge>,
              },
              {
                key: 'department',
                label: 'Department',
                render: (value) => value || '-',
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (value) => (
                  <Badge variant={value ? 'success' : 'danger'}>{value ? 'Active' : 'Inactive'}</Badge>
                ),
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
                    <DropdownItem onClick={() => handleEditUser(row)}>
                      <Edit className="h-4 w-4 mr-2 inline" />
                      Edit
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteUser(row)}>
                      <Trash2 className="h-4 w-4 mr-2 inline" />
                      Delete
                    </DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={users}
          />
        )}
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        initialData={selectedUser}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.first_name} ${userToDelete?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Users;
