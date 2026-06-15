import useForm from '../../hooks/useForm';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import FileUpload from '../../components/FileUpload/FileUpload';
import Button from '../../components/Button/Button';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const validate = (values) => {
    const errors = {};
    if (!values.name) errors.name = 'Product name is required';
    if (!values.sku) errors.sku = 'SKU is required';
    if (!values.price) errors.price = 'Price is required';
    return errors;
  };

  const { values, errors, handleChange, handleBlur, handleSubmit, resetForm } = useForm(
    initialData || {
      name: '',
      sku: '',
      description: '',
      category: '',
      brand: '',
      unit: 'piece',
      price: 0,
      cost_price: 0,
      tax_rate: 0,
      stock_quantity: 0,
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
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Product' : 'Add Product'} size="lg">
      <form onSubmit={(e) => handleSubmit(e, handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            placeholder="Enter product name"
            required
          />
          <Input
            label="SKU"
            name="sku"
            value={values.sku}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.sku}
            placeholder="Enter SKU"
            required
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={values.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={values.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="food">Food & Beverages</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Garden</option>
            <option value="other">Other</option>
          </Select>

          <Input
            label="Brand"
            name="brand"
            value={values.brand}
            onChange={handleChange}
            placeholder="Enter brand"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Unit"
            name="unit"
            value={values.unit}
            onChange={handleChange}
          >
            <option value="piece">Piece</option>
            <option value="kg">Kilogram</option>
            <option value="liter">Liter</option>
            <option value="box">Box</option>
            <option value="pack">Pack</option>
          </Select>

          <Input
            label="Price"
            name="price"
            type="number"
            value={values.price}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.price}
            min="0"
            step="0.01"
            required
          />

          <Input
            label="Cost Price"
            name="cost_price"
            type="number"
            value={values.cost_price}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tax Rate (%)"
            name="tax_rate"
            type="number"
            value={values.tax_rate}
            onChange={handleChange}
            min="0"
            step="0.1"
          />
          <Input
            label="Stock Quantity"
            name="stock_quantity"
            type="number"
            value={values.stock_quantity}
            onChange={handleChange}
            min="0"
          />
        </div>

        <FileUpload
          label="Product Image"
          accept="image/*"
          multiple={false}
          onFilesChange={(files) => {
            if (files.length > 0) {
              console.log('File selected:', files[0]);
            }
          }}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;
