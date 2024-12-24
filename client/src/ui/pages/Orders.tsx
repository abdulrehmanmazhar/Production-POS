import React, { useEffect, useState } from 'react';
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

type Bill = {
  id: number;
  name: string;
  address: string;
  contact: string;
  billDate: string;
  billLink: string;
};

const ITEMS_PER_PAGE = 15;

const Orders = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterDate, setFilterDate] = useState<string>('');
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  // const [paginatedBills, setPaginatedBills] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/get-orders");
      const allOrders = data.orders || [];
      const filteredOrders = showCompleted
        ? allOrders.filter((order: any) => order.bill)
        : allOrders.filter((order: any) => !order.bill);
  
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders.");
    }
  };

  const billCreator = async () => {
    try {
      const billArray: Bill[] = [];
      for (let order of orders) {
        try {
          const { data } = await axiosInstance.get(`/get-customer/${order.customerId}`);
          const customerData = data.customer;
          const bill: Bill = {
            id: order._id,
            name: customerData.name,
            address: customerData.address,
            contact: customerData.contact,
            billDate: order.updatedAt,
            billLink: order.bill,
          };
          billArray.push(bill);
        } catch (error) {
          console.error(`Error fetching customer data for order ${order.id}:`, error);
        }
      }
      setBills(billArray);
    } catch (error) {
      console.error("Error creating bills:", error);
      toast.error("Failed to create bills.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showCompleted]);

  useEffect(() => {
    if (orders.length > 0) {
      billCreator();
    }
  }, [orders]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
  };

  const handleSortChange = () => {
    const sortedBills = [...bills].sort((a, b) => {
      return sortDirection === 'asc'
        ? new Date(a.billDate).getTime() - new Date(b.billDate).getTime()
        : new Date(b.billDate).getTime() - new Date(a.billDate).getTime();
    });
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    setBills(sortedBills);
  };

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.billDate).toISOString().split('T')[0];
    return (
      bill.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!filterDate || billDate === filterDate)
    );
  });

  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills =  filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCheckboxChange = () => {
    setShowCompleted((prevShowCompleted) => !prevShowCompleted);
    console.log(paginatedBills);
    console.log(filteredBills)
  };
  const handleDeleteOrder = async (id: any) => {
    try {
      await axiosInstance.delete(`/delete-order/${id}`);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Orders</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '10px', flex: '2', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="date"
          value={filterDate}
          onChange={handleDateChange}
          style={{ padding: '10px', flex: '1', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button
          onClick={handleSortChange}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sort by Date ({sortDirection === 'asc' ? 'Newest' : 'Oldest'})
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={handleCheckboxChange}
            style={{ marginRight: '10px' }}
          />
          Completed Orders
        </label>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBills.map((bill, index) => (
            <tr key={bill.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
              <td>{`"${bill.id}"`}</td>
              <td>{bill.name}</td>
              <td>{bill.address}</td>
              <td>{bill.contact}</td>
              <td>{new Date(bill.billDate).toLocaleDateString()}</td>
              <td>
                {/* <a href={`${baseURL}/bills/${bill.billLink}`} target="_blank" rel="noopener noreferrer">
                  View Bill
                </a> */}
                <button className='edit-button'>Edit</button>
                <button className='delete-button' onClick={()=>handleDeleteOrder(bill.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === 1 ? '#ddd' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Prev
        </button>
        <span style={{ alignSelf: 'center' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{
            padding: '10px 20px',
            backgroundColor: currentPage === totalPages ? '#ddd' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;