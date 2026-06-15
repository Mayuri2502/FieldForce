import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import DatePicker from '../../components/DatePicker/DatePicker';
import Button from '../../components/Button/Button';

const VisitForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.customer_id) errors.customer_id = 'Customer is required';
    if (!values.type) errors.type = 'Visit type is required';
    if (!values.scheduled_date) errors.scheduled_date = 'Scheduled date is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue } = useForm(
    initialData || {
      customer_id: '',
      type: '',
      scheduled_date: '',
      purpose: '',
      notes: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Visit' : 'Schedule Visit'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <Select
          label="Customer"
          name="customer_id"
          value={values.customer_id}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.customer_id}
          required
        >
          <option value="">Select customer</option>
          <option value="1">ABC Corp</option>
          <option value="2">XYZ Ltd</option>
          <option value="3">Acme Inc</option>
        </Select>

        <Select
          label="Visit Type"
          name="type"
          value={values.type}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.type}
          required
        >
          <option value="">Select type</option>
          <option value="sales">Sales</option>
          <option value="follow_up">Follow Up</option>
          <option value="complaint">Complaint</option>
          <option value="collection">Collection</option>
        </Select>

        <DatePicker
          label="Scheduled Date & Time"
          value={values.scheduled_date}
          onChange={(value) => setFieldValue('scheduled_date', value)}
          error={errors.scheduled_date}
        />

        <Input
          label="Purpose"
          name="purpose"
          value={values.purpose}
          onChange={handleChange}
          placeholder="Enter visit purpose"
        />

        <Textarea
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Additional notes"
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Visit' : 'Schedule Visit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VisitForm;
