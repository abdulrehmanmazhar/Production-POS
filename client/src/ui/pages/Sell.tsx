// @ts-nocheck

import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from "react-toastify";

type Product = {
  _id: string;
  name: string;
  price: number;
};

type Item = {
  // _id: string;
  product: Product;
  qty: number;
};
interface ICustomer {
  _id: string;
  name: string;
}

const Sell = () => {
  const [updation, setUpdation]= useState('');
  const [customers,setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [searchCustomer, setSearchCustomer] = useState<string>('');

  const [currentProduct, setCurrentProduct] = useState<string| null>();
  const [quantity, setQuantity] = useState<number>(1);

  const [addedItems, setAddedItems] = useState<Item[]>([]);
  const [orderId, setOrderId] = useState();

  const [payment, setPayment] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(()=>{fetchCustomers(); fetchProducts()},[])

  const syncCart = async (order: any) =>{
    try {
      const {data}: any = await axiosInstance.get(`/get-order/${order._id}`);
      setAddedItems(data.order.cart);
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{if(updation === "update"){
    syncCart({_id:orderId})
    setUpdation("")
  }},[updation])

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get("/get-customers");
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      // toast.error("Failed to fetch customers.");
    }
  };
  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("/get-products");
      console.log(data)
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      // toast.error("Failed to fetch customers.");
    }
  };

  const handleAddItem = async () => {
    if (currentProduct && quantity > 0 && selectedCustomer) {
      const selectedProduct = products.find((p) => p._id === currentProduct);
  
      if (selectedProduct) {
        try {
          const response = await axiosInstance.post(
            `/fill-cart/${selectedCustomer}`,
            {
              productId: selectedProduct._id,
              qty: quantity,
            }
          );
  
          if (response.status === 200) {
            const { order } = response.data;
            setOrderId(order._id);
            await syncCart(order)
            // console.log(orderId)
  
            // Optionally update the UI with the added item details
            // setAddedItems((prevItems) => [
            //   ...prevItems,
            //   {
            //     _id: selectedProduct._id,
            //     name: selectedProduct.name,
            //     quantity,
            //     price: selectedProduct.price * quantity,
            //   },
            // ]);
  
            // Clear the product selection and quantity fields
            setCurrentProduct(null);
            setQuantity(1);
          }
        } catch (error) {
          console.error("Error adding item to cart:", error);
          // You can optionally show a toast or alert here
        }
      }
    } else {
      console.warn("Please select a customer, product, and valid quantity.");
    }
  };
  

  const handleDeleteItem = async (index: number) => {
    // setAddedItems((prevItems) => prevItems.filter((_, i) => i !== index));
    try {
      const {data} = await axiosInstance.delete(`/delete-cart/${orderId}/${index}`);
      toast.success("Item deleted and revered to stock successfully.");
      // syncCart(orderId);
      setUpdation("update")
      // setUpdation("")
    } catch (error) {
      toast.error("Failed to delete item.");
      console.log(error)
    }
  };

  const addOrderHandler = async () => {
    if (!orderId) {
      return console.warn("No order found");
    }
    setLoading(true);
    try {
      await axiosInstance.post(`/add-order/${orderId}`, {
        billPayment: payment,
        customerId: selectedCustomer,
      });
      toast.success("Order done successfully.");

      // Reset all states to default
      setSelectedCustomer('');
      setCurrentProduct(null);
      setQuantity(1);
      setAddedItems([]);
      setOrderId(undefined);
      setPayment(0);
    } catch (error) {
      toast.error("Failed to place order.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalBill = addedItems.reduce((sum, item) => sum + item.product.price*item.qty, 0);
  const totalDiscount = addedItems.reduce((sum, item) => sum + item.product.discount*item.qty, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Heading */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Sell</h2>

      {/* Customer Selection */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <option value="">Select Customer</option>
          {customers
            .filter((customer) => customer.name.toLowerCase().includes(searchCustomer.toLowerCase()))
            .map((customer, index) => (
              <option key={index} value={customer._id}>
                {customer.name}
              </option>
            ))}
        </select>
      </div>

      {/* Product Row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select
          value={currentProduct || ''}
          onChange={(e) => setCurrentProduct(e.target.value)}
          style={{
            flex: 3,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          placeholder="Quantity"
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleAddItem}
          style={{
            flex: 1,
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {/* Added Items */}
      <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
        {addedItems.map((item, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <input type='text' readOnly
              value={item.product.name}
              // onChange={(e) =>
              //   setAddedItems((prevItems) =>
              //     prevItems.map((it, i) =>
              //       i === index ? { ...it, productId: Number(e.target.value) } : it
              //     )
              //   )
              // }
              style={{ flex: 3, marginRight: '10px', padding: '5px' }}
            />
            <span style={{ flex: 1 }}>{item.qty}</span>
            <span style={{ flex: 1 }}>{item.product.price}</span>
            <span style={{ flex: 1 }}>{item.product.price*item.qty}</span>
            <button
              onClick={() => handleDeleteItem(index)}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '5px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Total and Payment Section */}
      <div style={{ marginBottom: '20px' }}>
      <div style={{display: "flex", alignItems: "center", gap:"1rem"}}>
        <h3>Total Bill: </h3>
        <input
          type="number"
          value={totalBill}
          readOnly
          placeholder="Enter payment"
          style={{
            width: '25%',
            height:"20px",
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <h3>PKR</h3>
        </div>
        <div style={{display: "flex", alignItems: "center", gap:"1rem"}}>
        <h3>Total Discount: </h3>
        <input
          type="number"
          value={totalDiscount}
          readOnly
          placeholder="Enter payment"
          style={{
            width: '25%',
            height:"20px",
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <h3>PKR</h3>
        </div>
        <div style={{display: "flex", alignItems: "center", gap:"1rem"}}>
        <h3>Sub Total: </h3>
        <input
          type="number"
          value={totalBill-totalDiscount}
          readOnly
          placeholder="Enter payment"
          style={{
            width: '25%',
            height:"20px",
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <h3>PKR</h3>
        </div>
        <div style={{display: "flex", alignItems: "center", gap:"1rem"}}>
        <h3>Bill Payment: </h3>
        <input
          type="number"
          value={payment}
          onChange={(e) => setPayment(Number(e.target.value))}
          placeholder="Enter payment"
          style={{
            width: '25%',
            height:"20px",
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <h3>PKR</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              flex: 1,
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={addOrderHandler}
          >
            {loading ? 'Processing...' : 'Generate Bill'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sell;
