import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, ShoppingCart, DollarSign, MoreVertical } from 'lucide-react';
import OrderForm from './OrderForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Orders = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', { search, status }],
    queryFn: () =>
      api.get('/orders', { params: { search, status } }).then((res) => res.data.data.orders),
  });

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/orders/${orderToDelete.id}`);
      queryClient.invalidateQueries(['orders']);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleSubmitOrder = async (data) => {
    try {
      if (selectedOrder) {
        await api.put(`/orders/${selectedOrder.id}`, data);
      } else {
        await api.post('/orders', data);
      }
      queryClient.invalidateQueries(['orders']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'approved':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage sales orders</p>
        </div>
        <Button onClick={handleCreateOrder}>
          <Plus className="h-5 w-5 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
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
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : orders?.length === 0 ? (
          <EmptyState
            icon="package"
            title="No orders found"
            description="Get started by creating your first order"
            action={handleCreateOrder}
            actionText="Create Order"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'order_number',
                label: 'Order #',
                sortable: true,
                render: (value) => <span className="font-medium text-gray-900">{value}</span>,
              },
              {
                key: 'customer',
                label: 'Customer',
                render: (_, row) => <p className="text-gray-600">{row.customer?.name || 'N/A'}</p>,
              },
              {
                key: 'order_date',
                label: 'Date',
                format: 'date',
              },
              {
                key: 'status',
                label: 'Status',
                render: (value) => <Badge variant={getStatusColor(value)}>{value}</Badge>,
              },
              {
                key: 'total_amount',
                label: 'Total',
                format: 'currency',
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
                    <DropdownItem onClick={() => handleEditOrder(row)}>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteOrder(row)}>Delete</DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={orders}
          />
        )}
      </div>

      {/* Order Form Modal */}
      <OrderForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitOrder}
        initialData={selectedOrder}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order ${orderToDelete?.order_number}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Orders;
