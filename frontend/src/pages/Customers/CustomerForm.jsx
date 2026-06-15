import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import Button from '../../components/Button/Button';

const CustomerForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Customer name is required';
    if (!values.phone) errors.phone = 'Phone number is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm } = useForm(
    initialData || {
      name: '',
      business_name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      country: '',
      category: '',
      customer_type: 'lead',
      latitude: '',
      longitude: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Customer' : 'Add Customer'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <Input
          label="Customer Name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          placeholder="Enter customer name"
          required
        />

        <Input
          label="Business Name"
          name="business_name"
          value={values.business_name}
          onChange={handleChange}
          placeholder="Enter business name"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            placeholder="Enter phone number"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="Enter email address"
          />
        </div>

        <Textarea
          label="Address"
          name="address"
          value={values.address}
          onChange={handleChange}
          placeholder="Enter full address"
          rows={2}
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="City"
            name="city"
            value={values.city}
            onChange={handleChange}
            placeholder="Enter city"
          />
          <Input
            label="State"
            name="state"
            value={values.state}
            onChange={handleChange}
            placeholder="Enter state"
          />
          <Input
            label="Country"
            name="country"
            value={values.country}
            onChange={handleChange}
            placeholder="Enter country"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={values.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
            <option value="manufacturer">Manufacturer</option>
          </Select>

          <Select
            label="Customer Type"
            name="customer_type"
            value={values.customer_type}
            onChange={handleChange}
          >
            <option value="lead">Lead</option>
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;
