import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, Filter, MoreVertical, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import TaskForm from './TaskForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';

const Tasks = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', { search, status, priority }],
    queryFn: () =>
      api.get('/tasks', { params: { search, status, priority } }).then((res) => res.data.data.tasks),
  });

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (data) => {
    try {
      if (selectedTask) {
        await api.put(`/tasks/${selectedTask.id}`, data);
      } else {
        await api.post('/tasks', data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Task',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value) => <span className="capitalize text-gray-600">{value?.replace('_', ' ')}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <div className="flex items-center">
          {getStatusIcon(value)}
          <Badge variant={getStatusColor(value)} className="ml-2">
            {value?.replace('_', ' ')}
          </Badge>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value) => <Badge variant={getPriorityColor(value)}>{value}</Badge>,
    },
    {
      key: 'due_date',
      label: 'Due Date',
      format: 'date',
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
          <DropdownItem onClick={() => handleEditTask(row)}>Edit</DropdownItem>
          <DropdownDivider />
          <DropdownItem danger>Delete</DropdownItem>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track tasks</p>
        </div>
        <Button onClick={handleCreateTask}>
          <Plus className="h-5 w-5 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
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
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : tasks?.length === 0 ? (
          <EmptyState
            icon="fileText"
            title="No tasks found"
            description="Get started by creating your first task"
            action={handleCreateTask}
            actionText="Create Task"
          />
        ) : (
          <DataTable columns={columns} data={tasks} />
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTask}
        initialData={selectedTask}
      />
    </div>
  );
};

export default Tasks;
