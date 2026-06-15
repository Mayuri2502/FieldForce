import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import DatePicker from '../../components/DatePicker/DatePicker';
import FileUpload from '../../components/FileUpload/FileUpload';
import Button from '../../components/Button/Button';

const ExpenseForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.category) errors.category = 'Category is required';
    if (!values.amount) errors.amount = 'Amount is required';
    if (!values.expense_date) errors.expense_date = 'Expense date is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue } = useForm(
    initialData || {
      category: '',
      amount: 0,
      description: '',
      expense_date: '',
      payment_method: '',
      receipt_url: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Expense' : 'Add Expense'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <Select
          label="Category"
          name="category"
          value={values.category}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.category}
          required
        >
          <option value="">Select category</option>
          <option value="travel">Travel</option>
          <option value="meals">Meals</option>
          <option value="accommodation">Accommodation</option>
          <option value="transportation">Transportation</option>
          <option value="supplies">Supplies</option>
          <option value="communication">Communication</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.amount}
            min="0"
            step="0.01"
            required
          />
          <Select
            label="Payment Method"
            name="payment_method"
            value={values.payment_method}
            onChange={handleChange}
          >
            <option value="">Select method</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="company_card">Company Card</option>
          </Select>
        </div>

        <DatePicker
          label="Expense Date"
          value={values.expense_date}
          onChange={(value) => setFieldValue('expense_date', value)}
          error={errors.expense_date}
        />

        <Input
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Enter expense description"
        />

        <FileUpload
          label="Receipt"
          accept="image/*,.pdf"
          multiple={false}
          onFilesChange={(files) => {
            if (files.length > 0) {
              console.log('File selected:', files[0]);
            }
          }}
        />

        <Textarea
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Additional notes"
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Expense' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
