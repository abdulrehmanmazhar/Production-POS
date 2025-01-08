// @ts-nocheck

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

interface Product {
  _id?: string;
  name: string;
  category: string;
  price: number;
  stockQty: number;
  discount: number;
  totalBill: number;
}

const Product: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('addProduct');
  const [productName, setProductName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [stockQty, setStockQty] = useState<string>('');
  const [discount, setDiscount] = useState<string>('0');
  const [totalBill, setTotalBill] = useState<string>('0');
  const [categories, setCategories] = useState<string[]>(['Electronics', 'Clothing', 'Books']);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('');
  const [refreshCategories, setRefreshCategories] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product>({
    _id:"",
    name: '',
    category: '',
    price: 0,
    stockQty: 0,
    discount: 0,
    totalBill: 0
  });

  const [restockProductName, setRestockProductName] = useState<string>('');

  const productSync = async () => {
    try {
      const response = await axiosInstance.get('/get-products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products.');
    }
  };

  const syncCategory = () => {
    axiosInstance
      .get('/get-products')
      .then((response) => {
        const uniqueCategories: string[] = Array.from(
          new Set(response.data.products.map((product: Product) => product.category))
        );
        setCategories(uniqueCategories);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  };

  useEffect(() => {
    syncCategory();
    productSync();
  }, [refreshCategories]);

  const handleAddCategory = (): void => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!productName || !selectedCategory || !price || !stockQty) {
      alert('Please fill in all fields');
      return;
    }

    const newProduct: Product = {
      name: productName,
      category: selectedCategory,
      price: parseFloat(price),
      stockQty: parseInt(stockQty, 10),
      discount: parseFloat(discount),
      totalBill: parseFloat(totalBill),
    };

    axiosInstance
      .post('/add-product', newProduct)
      .then(() => {
        toast.success('Product added successfully');
        setRefreshCategories((prev) => !prev);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      });

    setProductName('');
    setSelectedCategory('');
    setPrice('');
    setStockQty('');
    setDiscount('0');
    setTotalBill('0');
  };

  const handleRestockSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Please enter a product');
      return;
    }
    const newProduct: Product = {
      name: productName,
      category: selectedCategory,
      price: parseFloat(price),
      stockQty: parseInt(stockQty, 10),
      discount: parseFloat(discount),
      totalBill: parseFloat(totalBill),
    };

    axiosInstance
      .put(`/restock-product/${selectedProduct._id}`, newProduct)
      .then(() => {
        toast.success(`Product "${selectedProduct.name}" restocked successfully`);
        setRestockProductName('');
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'An error occurred');
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('addProduct')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: activeTab === 'addProduct' ? '#007BFF' : '#f0f0f0',
            color: activeTab === 'addProduct' ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add Product
        </button>
        <button
          onClick={() => setActiveTab('restock')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: activeTab === 'restock' ? '#007BFF' : '#f0f0f0',
            color: activeTab === 'restock' ? '#fff' : '#000',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Restock
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'addProduct' ? (
        <div>
          <h2>Add Product</h2>
          <form onSubmit={handleFormSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>Product Name:</label>
              <input
                type="text"
                value={productName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
                placeholder="Enter product name"
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newCategory}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                placeholder="Add new category"
                style={{ width: 'calc(100% - 60px)', padding: '8px', marginRight: '8px' }}
              />
              <button type="button" onClick={handleAddCategory} style={{ padding: '8px' }}>
                Add
              </button>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Price:</label>
              <input
                type="number"
                value={price}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                placeholder="Enter product price"
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Stock Quantity:</label>
              <input
                type="number"
                value={stockQty}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStockQty(e.target.value)}
                placeholder="Enter stock quantity"
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Discount:</label>
              <input
                type="number"
                value={discount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDiscount(e.target.value)}
                placeholder="Enter discount"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label>Total Bill:</label>
              <input
                type="number"
                value={totalBill}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalBill(e.target.value)}
                placeholder="Enter total bill"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <button type="submit" style={{ padding: '10px 20px' }}>
              Done
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Restock</h2>
          <form onSubmit={handleRestockSubmit}>
  <div style={{ marginBottom: '10px' }}>
    <label>Select Product:</label>
    <select
      value={selectedProduct?.name || ''} // Ensure a string value
      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
        const selected = products.find((product) => product.name === e.target.value);
        if (selected) {
          setSelectedProduct(selected); // Set the entire product object
        }
      }}
      style={{ width: '100%', padding: '10px', marginTop: '10px' }}
    >
      <option value="">
        Select a product
      </option>
      {products.map((product) => (
        <option key={product._id} value={product.name}>
          {`${product.name} (${product.category})`}
        </option>
      ))}
    </select>
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label>Category:</label>
    <input
      type="text"
      value={selectedProduct?.category || ''}
      readOnly // Prevent user editing
      style={{ width: '100%', padding: '8px' }}
    />
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label>Price:</label>
    <input
      type="number"
      onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
      value={price || 0}
      style={{ width: '100%', padding: '8px' }}
    />
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label>In-flux of Stock Quantity:</label>
    <input
      type="number"
      value={stockQty}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setStockQty(e.target.value)}
      placeholder="Enter stock quantity"
      required
      style={{ width: '100%', padding: '8px' }}
    />
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label>Discount:</label>
    <input
      type="number"
      value={discount}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setDiscount(e.target.value)}
      placeholder="Enter discount"
      style={{ width: '100%', padding: '8px' }}
    />
  </div>
  <div style={{ marginBottom: '10px' }}>
    <label>Total Bill:</label>
    <input
      type="number"
      value={totalBill}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalBill(e.target.value)}
      placeholder="Enter total bill"
      style={{ width: '100%', padding: '8px' }}
    />
  </div>
  <button type="submit" style={{ padding: '10px 20px' }}>
    Restock
  </button>
</form>

        </div>
      )}
    </div>
  );
};

export default Product;
