import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import Avatar from '../../components/Avatar/Avatar';

const UserForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.first_name) errors.first_name = 'First name is required';
    if (!values.last_name) errors.last_name = 'Last name is required';
    if (!values.email) errors.email = 'Email is required';
    if (!values.role) errors.role = 'Role is required';
    if (!values.password && !initialData) errors.password = 'Password is required';
    if (values.password && values.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue } = useForm(
    initialData || {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: '',
      department: '',
      designation: '',
      phone: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit User' : 'Add User'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar initials={`${values.first_name?.[0] || ''}${values.last_name?.[0] || ''}`} size="xl" />
          <div>
            <p className="text-sm text-gray-600">Profile Preview</p>
            <p className="font-medium text-gray-900">
              {values.first_name} {values.last_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="first_name"
            value={values.first_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.first_name}
            placeholder="Enter first name"
            required
          />
          <Input
            label="Last Name"
            name="last_name"
            value={values.last_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.last_name}
            placeholder="Enter last name"
            required
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          placeholder="Enter email address"
          required
        />

        {!initialData && (
          <Input
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="Enter password (min 6 characters)"
            required
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Role"
            name="role"
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.role}
            required
          >
            <option value="">Select role</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="company_admin">Company Admin</option>
          </Select>

          <Input
            label="Department"
            name="department"
            value={values.department}
            onChange={handleChange}
            placeholder="Enter department"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Designation"
            name="designation"
            value={values.designation}
            onChange={handleChange}
            placeholder="Enter designation"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update User' : 'Add User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
