import { useState } from 'react';
import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import Button from '../../components/Button/Button';
import { Plus, Trash2 } from 'lucide-react';

const OrderForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [items, setItems] = useState(initialData?.items || []);

  const validate = (values) => {
    const errors = {};
    if (!values.customer_id) errors.customer_id = 'Customer is required';
    if (items.length === 0) errors.items = 'At least one item is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm, setFieldValue } = useForm(
    initialData || {
      customer_id: '',
      discount_amount: 0,
      discount_type: 'amount',
      notes: '',
    },
    validate,
    onSubmit
  );

  const addItem = () => {
    setItems([...items, { product_id: '', product_name: '', quantity: 1, unit_price: 0, discount_amount: 0, tax_rate: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price - item.discount_amount;
      return sum + itemTotal * (1 + item.tax_rate / 100);
    }, 0) - (values.discount_amount || 0);
  };

  const handleFormSubmit = async (data) => {
    await onSubmit({ ...data, items, total_amount: calculateTotal() });
    resetForm();
    setItems([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Order' : 'Create Order'} size="xl">
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

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label">Order Items</label>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          {items.length === 0 && <p className="text-sm text-gray-500">No items added yet</p>}
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-2">
              <div className="flex justify-end mb-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                  <Trash2 className="h-4 w-4 text-danger-600" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Product"
                  value={item.product_id}
                  onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                >
                  <option value="">Select product</option>
                  <option value="1">Product A</option>
                  <option value="2">Product B</option>
                  <option value="3">Product C</option>
                </Select>
                <Input
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                  min="1"
                />
                <Input
                  label="Unit Price"
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Discount"
                  type="number"
                  value={item.discount_amount}
                  onChange={(e) => updateItem(index, 'discount_amount', Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  value={item.tax_rate}
                  onChange={(e) => updateItem(index, 'tax_rate', Number(e.target.value))}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          ))}
          {errors.items && <p className="text-sm text-danger-600 mt-1">{errors.items}</p>}
        </div>

        {/* Discount */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Discount Amount"
            name="discount_amount"
            type="number"
            value={values.discount_amount}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          <Select
            label="Discount Type"
            name="discount_type"
            value={values.discount_type}
            onChange={handleChange}
          >
            <option value="amount">Amount</option>
            <option value="percentage">Percentage</option>
          </Select>
        </div>

        <Textarea
          label="Notes"
          name="notes"
          value={values.notes}
          onChange={handleChange}
          placeholder="Order notes"
          rows={2}
        />

        {/* Total */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total Amount:</span>
            <span className="text-xl font-bold text-gray-900">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OrderForm;
