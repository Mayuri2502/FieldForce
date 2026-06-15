import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Search, Package, DollarSign, MoreVertical } from 'lucide-react';
import ProductForm from './ProductForm';
import DataTable from '../../components/DataTable/DataTable';
import Badge from '../../components/Badge/Badge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Loading from '../../components/Loading/Loading';
import Button from '../../components/Button/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../components/Dropdown/Dropdown';
import ConfirmModal from '../../components/Modal/ConfirmModal';

const Products = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { search, category }],
    queryFn: () =>
      api.get('/products', { params: { search, category } }).then((res) => res.data.data.products),
  });

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete.id}`);
      queryClient.invalidateQueries(['products']);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleSubmitProduct = async (data) => {
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct.id}`, data);
      } else {
        await api.post('/products', data);
      }
      queryClient.invalidateQueries(['products']);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Button onClick={handleCreateProduct}>
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="food">Food</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        {isLoading ? (
          <Loading />
        ) : products?.length === 0 ? (
          <EmptyState
            icon="package"
            title="No products found"
            description="Get started by adding your first product"
            action={handleCreateProduct}
            actionText="Add Product"
          />
        ) : (
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Product',
                sortable: true,
                render: (_, row) => (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">{row.name}</p>
                  </div>
                ),
              },
              {
                key: 'sku',
                label: 'SKU',
                render: (value) => value || '-',
              },
              {
                key: 'category',
                label: 'Category',
                render: (value) => <Badge variant="primary">{value || 'N/A'}</Badge>,
              },
              {
                key: 'price',
                label: 'Price',
                format: 'currency',
              },
              {
                key: 'stock_quantity',
                label: 'Stock',
                render: (value) => (
                  <span className={value <= 10 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {value || 0}
                  </span>
                ),
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
                    <DropdownItem onClick={() => handleEditProduct(row)}>Edit</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={() => handleDeleteProduct(row)}>Delete</DropdownItem>
                  </Dropdown>
                ),
              },
            ]}
            data={products}
          />
        )}
      </div>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
        initialData={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Products;
