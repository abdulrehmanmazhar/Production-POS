import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  purchasePrice: number;
  stockQty: number;
}

const Stock: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewInStock, setViewInStock] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    productSync();
  }, []);

  const productSync = async () => {
    try {
      const response = await axiosInstance.get('/get-products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products.');
    }
  };

  const handleEditChange = (field: keyof Product, value: string | number) => {
    if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, [field]: value });
    }
  };

  const handleDoneEdit = async () => {
    if (selectedProduct) {
      try {
        await axiosInstance.put(`/edit-product/${selectedProduct._id}`, selectedProduct);
        toast.success('Product edited successfully');
        productSync();
        setSelectedProduct(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to edit product.');
      }
    }
  };

  const handleDelete = async () => {
    if (selectedProduct) {
      try {
        await axiosInstance.delete(`/delete-product/${selectedProduct._id}`);
        toast.success('Product deleted successfully');
        productSync();
        setSelectedProduct(null);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    viewInStock ? product.stockQty > 0 : product.stockQty === 0
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const buttonStyle = (isActive: boolean) => ({
    padding: '10px 20px',
    marginRight: '10px',
    backgroundColor: isActive ? '#007BFF' : '#DDD',
    color: '#FFF',
    border: 'none',
    cursor: 'pointer',
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* Info Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ flex: 1, margin: '10px', padding: '20px', border: '1px solid #ddd', textAlign: 'center' }}>
          <h4>Total Products</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{products.length}</p>
        </div>
        <div style={{ flex: 1, margin: '10px', padding: '20px', border: '1px solid #ddd', textAlign: 'center' }}>
          <h4>Stock Value</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            PKR {products.reduce((acc, product) => acc + product.stockQty * product.purchasePrice, 0)}
          </p>
        </div>
        <div style={{ flex: 1, margin: '10px', padding: '20px', border: '1px solid #ddd', textAlign: 'center' }}>
          <h4>Total Categories</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {Array.from(new Set(products.map(product => product.category))).length}
          </p>
        </div>
      </div>

      {/* Stock Management Section */}
      <div>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <button style={buttonStyle(viewInStock)} onClick={() => setViewInStock(true)}>
            In Stock Products
          </button>
          <button style={buttonStyle(!viewInStock)} onClick={() => setViewInStock(false)}>
            Out of Stock Products
          </button>
        </div>

        {/* Product List */}
        <div style={{ width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Product Name</th>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Price</th>
                <th style={{ padding: '10px' }}>Remaining Quantity</th>
                <th style={{ padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map(product => (
                <tr key={product._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{product.name}</td>
                  <td style={{ padding: '10px' }}>{product.category}</td>
                  <td style={{ padding: '10px' }}>{product.price}</td>
                  <td style={{ padding: '10px' }}>{product.stockQty}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#28a745',
                        color: '#FFF',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedProduct(product)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={buttonStyle(currentPage > 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={buttonStyle(page === currentPage)}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={buttonStyle(currentPage < totalPages)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for Editing Product */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: '#FFF',
            border: '1px solid #ddd',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            width: '500px',
          }}
        >
          <h3>Manage Product</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label>Product Name:</label>
              <input
                type="text"
                onChange={e => handleEditChange('name', e.target.value)}
                value={selectedProduct.name}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div>
              <label>Price:</label>
              <input
                type="number"
                readOnly
                value={selectedProduct.price}
                onChange={e => handleEditChange('price', parseFloat(e.target.value))}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div>
              <label>Remaining Quantity:</label>
              <input
                type="number"
                readOnly
                value={selectedProduct.stockQty}
                onChange={e => handleEditChange('stockQty', parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={handleDelete}
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: '#FFF', border: 'none' }}
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#FFF', border: 'none' }}
            >
              Cancel
            </button>
            <button
              onClick={handleDoneEdit}
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: '#FFF', border: 'none' }}
            >
              Done Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
