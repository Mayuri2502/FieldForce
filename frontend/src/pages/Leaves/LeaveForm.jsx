import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import DatePicker from '../../components/DatePicker/DatePicker';
import Button from '../../components/Button/Button';

const LeaveForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.leave_type) errors.leave_type = 'Leave type is required';
    if (!values.start_date) errors.start_date = 'Start date is required';
    if (!values.end_date) errors.end_date = 'End date is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue } = useForm(
    initialData || {
      leave_type: '',
      start_date: '',
      end_date: '',
      reason: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Leave Request' : 'Request Leave'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <Select
          label="Leave Type"
          name="leave_type"
          value={values.leave_type}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.leave_type}
          required
        >
          <option value="">Select type</option>
          <option value="sick">Sick Leave</option>
          <option value="casual">Casual Leave</option>
          <option value="earned">Earned Leave</option>
          <option value="maternity">Maternity Leave</option>
          <option value="paternity">Paternity Leave</option>
          <option value="unpaid">Unpaid Leave</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            label="Start Date"
            value={values.start_date}
            onChange={(value) => setFieldValue('start_date', value)}
            error={errors.start_date}
          />
          <DatePicker
            label="End Date"
            value={values.end_date}
            onChange={(value) => setFieldValue('end_date', value)}
            error={errors.end_date}
          />
        </div>

        <Textarea
          label="Reason"
          name="reason"
          value={values.reason}
          onChange={handleChange}
          placeholder="Enter reason for leave"
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Request' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveForm;
