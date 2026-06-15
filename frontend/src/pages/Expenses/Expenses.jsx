import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, Receipt, DollarSign, MoreVertical } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Expenses = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', { search, status }],
    queryFn: () =>
      api.get('/expenses', { params: { search, status } }).then((res) => res.data.data.expenses),
  });

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/expenses/${expenseToDelete.id}`);
      queryClient.invalidateQueries(['expenses']);
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleSubmitExpense = async (data) => {
    try {
      if (selectedExpense) {
        await api.put(`/expenses/${selectedExpense.id}`, data);
      } else {
        await api.post('/expenses', data);
      }
      queryClient.invalidateQueries(['expenses']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save expense:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Manage expense reports</p>
        </div>
        <Button onClick={handleCreateExpense}>
          <Plus className="h-5 w-5 mr-2" />
          Submit Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
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
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : expenses?.length === 0 ? (
          <EmptyState
            icon="fileText"
            title="No expenses found"
            description="Get started by submitting your first expense"
            action={handleCreateExpense}
            actionText="Submit Expense"
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
                key: 'category',
                label: 'Category',
                render: (value) => <span className="capitalize text-gray-600">{value}</span>,
              },
              {
                key: 'expense_date',
                label: 'Date',
                format: 'date',
              },
              {
                key: 'amount',
                label: 'Amount',
                format: 'currency',
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
                    <DropdownItem onClick={() => handleEditExpense(row)}>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteExpense(row)}>Delete</DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={expenses}
          />
        )}
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitExpense}
        initialData={selectedExpense}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Expenses;
