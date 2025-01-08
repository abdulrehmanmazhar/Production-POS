// @ts-nocheck

import React, { useEffect, useState } from 'react';
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import html2pdf from "html2pdf.js";
import { baseURL } from '../utils/axiosInstance';

type Bill = {
  id: number;
  name: string;
  address: string;
  contact: string;
  billDate: string;
  billLink: string;
  customerId: string;
  createdBy: string;
  total:number;
};

const ITEMS_PER_PAGE = 9;

const Orders = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [orderTakers, setOrderTakers] = useState<[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState('All');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterDate, setFilterDate] = useState<string>('');
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [showID, setShowID] = useState<boolean>(false);

  const navigate = useNavigate();
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
      const { data: userData } = await axiosInstance.get(`/get-all-users-admin`);
      const users = userData.users;
  
      const customerDataPromises = orders.map(order =>
        axiosInstance.get(`/get-customer/${order.customerId}`).catch(() => null)
      );
      const customerResponses = await Promise.all(customerDataPromises);
  
      const billArray = orders.map((order, index) => {
        const customerData = customerResponses[index]?.data?.customer;
        return customerData
          ? {
              id: order._id,
              name: customerData.name,
              address: customerData.address,
              contact: customerData.contact,
              billDate: order.updatedAt,
              billLink: order.bill,
              customerId: order.customerId,
              total:order.total,
              createdBy: users.find((user: any) => user._id === order.createdBy)?.name || 'Unknown',
            }
          : null;
      }).filter(Boolean); // Filter out nulls
  
      setBills(billArray);
    } catch (error) {
      console.error("Error creating bills:", error);
      toast.error("Failed to create bills.");
    }
  };
  useEffect(()=>{
    const users:any = [];
    for (let bill of bills){
      if(!users.includes(bill.createdBy)){
        users.push(bill.createdBy);
      }
    }
    setOrderTakers(users);
  },[bills,orders]);

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
      (bill.name.toLowerCase().includes(searchQuery.toLowerCase()) || bill.contact.includes(searchQuery)) &&
      (!filterDate || billDate === filterDate) && (filter === 'All' || bill.createdBy === filter)
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
  };
  const handleIDChange = () => {
    setShowID((prevShowID) => !prevShowID);
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

//   const handleGenOrder = async (orderId:any,customerId:any) => {
//     if (!orderId) {
//       return console.warn("No order found");
//     }
//     try {
//       await axiosInstance.post(`/add-order/${orderId}`, {
//         billPayment: 0,
//         customerId,
//       });
//       toast.success("Order done successfully with zero payment.");
//     } catch (error) {
//       toast.error("Failed to place order.");
//       console.error(error);
//   }
// }
const handleOpenOrder = (customerId: string, orderId: any) => {
  navigate(`/sell`, { state: { customerId, stateOrderId:orderId } }); // Navigate with state
};
const billDownloader = async () => {
  if (!bills || bills.length === 0) {
    toast.error("No bills available for download.");
    return;
  }

  for (const bill of filteredBills) {
    if (bill.billLink) {
      try {
        const response = await fetch(`${baseURL}/bills/${bill.billLink}`);
        if (!response.ok) {
          console.error(`Failed to fetch bill for ${bill.name}: ${response.statusText}`);
          continue;
        }

        const blob = await response.blob(); // Get the file as a Blob
        const url = URL.createObjectURL(blob); // Create a temporary URL for the Blob

        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${bill.name.replace(/\s+/g, '_')}_${bill.address}_bill.pdf`; // Example: John_Doe_bill_123.pdf
        document.body.appendChild(anchor); // Append to the DOM temporarily
        anchor.click(); // Trigger the download
        document.body.removeChild(anchor); // Remove the anchor
        URL.revokeObjectURL(url); // Clean up the Blob URL
      } catch (error) {
        console.error(`Error downloading bill for ${bill.name}:`, error);
      }
    } else {
      console.warn(`Bill for ${bill.name} does not have a valid link.`);
    }
  }

  toast.success("All bills have been downloaded.");
};



const handleReportGenerator = ()=>{
  const users:any = [];
  for (let bill of bills){
    if(!users.includes(bill.createdBy)){
      users.push(bill.createdBy);
    }
  }
  let userObj:any={};
  for(let user of users){
    userObj[user] = filteredBills.filter((bill)=>bill.createdBy === user )
    
  }
  // console.log(userObj);
  const reportHTML = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h1 style="font-size: 24px; text-align: center; color: #333;">Orders Report</h1>
    <h3 style="font-size: 18px; margin-bottom: 20px; color: #555;">Total Orders: ${filteredBills.length}</h3>
    <table border="1" cellspacing="0" cellpadding="10" style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="background-color: #f2f2f2; color: #333;">
          <th style="width: 5%;">#</th>
          <th style="width: 30%;">Name</th>
          <th style="width: 40%;">Address</th>
          <th style="width: 25%;">Value</th>
          <th style="width: 25%;">Bill Date</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(userObj)
          .map(
            ([user, bills], userIndex) => `
            <tr>
              <td colspan="4" style="font-weight: bold; background-color: #d9edf7; color: #31708f; text-align: left;">
                ${userIndex + 1}. Created by: ${user}
              </td>
            </tr>
            ${bills
              .map(
                (bill, billIndex) => `
                <tr>
                  <td style="text-align: center;">${billIndex + 1}</td>
                  <td>${bill.name}</td>
                  <td>${bill.address}</td>
                  <td>${bill.total}</td>
                  <td>${new Date(bill.billDate).toLocaleDateString()}</td>
                </tr>
                `
              )
              .join("")}
          `
          )
          .join("")}
      </tbody>
    </table>
  </div>
`;

    const options = {
          margin: 0.25,
          filename: `orders_report.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };
      
        html2pdf()
          .from(reportHTML)
          .set(options)
          .save()
          .catch((error: any) => {
            console.error("Error generating PDF:", error);
            toast.error("Failed to generate PDF.");
          });
}


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Orders</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by name or contact"
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
        <label style={{ marginRight: '50px' }}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={handleCheckboxChange}
            style={{ marginRight: '10px' }}
          />
          Completed Orders
        </label>
        <label style={{ marginRight: '50px' }}>
          <input
            type="checkbox"
            checked={showID}
            onChange={handleIDChange}
            style={{ marginRight: '10px' }}
          />
          Show ID
        </label>
        <label >Order-Takers:</label>
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
  >
    {orderTakers.map((person)=>(<option value={person}>{person}</option>))}
    <option value={'All'}>All</option>
  </select>
        
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>#</th>
            {showID&&<th>ID</th>}
            <th>Name</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Created By</th>
            <th>Date, Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBills.map((bill, index) => (
            <tr key={bill.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
              {showID && <td>{`"${bill.id}"`}</td>}
              <td>{bill.name}</td>
              <td>{bill.address}</td>
              <td>{bill.contact}</td>
              <td>{bill.createdBy}</td>
              <td>{new Date(bill.billDate).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td>
                {/* <a href={`${baseURL}/bills/${bill.billLink}`} target="_blank" rel="noopener noreferrer">
                  View Bill
                </a> */}
                <button className='delete-button' onClick={()=>handleDeleteOrder(bill.id)}>Delete</button>
                {!bill.billLink && <button className='gen-button' onClick={() => handleOpenOrder(bill.customerId, bill.id)}>Open</button>}
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
      <button onClick={handleReportGenerator} className="download-button gen-button">
     Download Orders Report
   </button>
   <button onClick={billDownloader} className="download-button gen-button">
     Download Bills
   </button>
    </div>
  );
};

export default Orders;
