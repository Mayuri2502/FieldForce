import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import DatePicker from '../../components/DatePicker/DatePicker';
import Button from '../../components/Button/Button';

const TaskForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.title) errors.title = 'Title is required';
    if (!values.type) errors.type = 'Type is required';
    if (!values.priority) errors.priority = 'Priority is required';
    if (!values.assigned_to) errors.assigned_to = 'Assignee is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue } = useForm(
    initialData || {
      title: '',
      description: '',
      type: '',
      priority: '',
      assigned_to: '',
      due_date: '',
      customer_id: '',
    },
    validate,
    onSubmit
  );

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'Create Task'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <Input
          label="Title"
          name="title"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.title}
          placeholder="Enter task title"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            name="type"
            value={values.type}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.type}
            required
          >
            <option value="">Select type</option>
            <option value="visit">Visit</option>
            <option value="meeting">Meeting</option>
            <option value="survey">Survey</option>
            <option value="collection">Collection</option>
            <option value="service_request">Service Request</option>
          </Select>

          <Select
            label="Priority"
            name="priority"
            value={values.priority}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.priority}
            required
          >
            <option value="">Select priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Assign To"
            name="assigned_to"
            value={values.assigned_to}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.assigned_to}
            required
          >
            <option value="">Select employee</option>
            <option value="1">John Doe</option>
            <option value="2">Jane Smith</option>
            <option value="3">Bob Johnson</option>
          </Select>

          <DatePicker
            label="Due Date"
            value={values.due_date}
            onChange={(value) => setFieldValue('due_date', value)}
          />
        </div>

        <Select
          label="Customer (Optional)"
          name="customer_id"
          value={values.customer_id}
          onChange={handleChange}
        >
          <option value="">Select customer</option>
          <option value="1">ABC Corp</option>
          <option value="2">XYZ Ltd</option>
          <option value="3">Acme Inc</option>
        </Select>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
