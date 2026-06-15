import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, MapPin, Phone, Mail, MoreVertical } from 'lucide-react';
import CustomerForm from './CustomerForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Customers = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', { search, category }],
    queryFn: () =>
      api.get('/customers', { params: { search, category } }).then((res) => res.data.data.customers),
  });

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      queryClient.invalidateQueries(['customers']);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const handleSubmitCustomer = async (data) => {
    try {
      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer.id}`, data);
      } else {
        await api.post('/customers', data);
      }
      queryClient.invalidateQueries(['customers']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer relationships</p>
        </div>
        <Button onClick={handleCreateCustomer}>
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Categories</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : customers?.length === 0 ? (
          <EmptyState
            icon="package"
            title="No customers found"
            description="Get started by adding your first customer"
            action={handleCreateCustomer}
            actionText="Add Customer"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Customer',
                sortable: true,
                render: (_, row) => (
                  <div>
                    <p className="font-medium text-gray-900">{row.name}</p>
                    {row.business_name && (
                      <p className="text-sm text-gray-500">{row.business_name}</p>
                    )}
                  </div>
                ),
              },
              {
                key: 'contact',
                label: 'Contact',
                render: (_, row) => (
                  <div className="space-y-1">
                    {row.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {row.phone}
                      </div>
                    )}
                    {row.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {row.email}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'category',
                label: 'Category',
                render: (value) => <Badge variant="primary">{value || 'N/A'}</Badge>,
              },
              {
                key: 'customer_type',
                label: 'Type',
                render: (value) => <Badge variant="info">{value?.replace('_', ' ')}</Badge>,
              },
              {
                key: 'current_balance',
                label: 'Balance',
                render: (value) => `$${parseFloat(value || 0).toFixed(2)}`,
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
                    <DropdownItem onClick={() => handleEditCustomer(row)}>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteCustomer(row)}>Delete</DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={customers}
          />
        )}
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitCustomer}
        initialData={selectedCustomer}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Customers;
