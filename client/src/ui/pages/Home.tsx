// @ts-nocheck

import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import html2pdf from "html2pdf.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Transaction {
  description: string;
  amount: number;
  createdAt: string;
}

interface Filters {
  type: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

const Home = () => {
  const [filter, setFilter] = useState<string>("today");
  const [transactionType, setTransactionType] = useState<string>("sale");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartDataValues, setChartDataValues] = useState<number[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchData = async (filters: any) => {
    try {
      const { data } = await axiosInstance.post("/get-sales", filters);
      const response = await axiosInstance.get("/get-orders");
      setTransactions(data.transactions);
      setOrders(response.data.orders)

      // Calculate total amount
      const total = data.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      setTotalAmount(total);

      // Update chart data
      if (filter === "thisYear") {
        const monthlyData = Array(12).fill(0);
        data.transactions.forEach((transaction: any) => {
          const month = new Date(transaction.createdAt).getMonth();
          monthlyData[month] += transaction.amount;
        });
        setChartLabels([
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ]);
        setChartDataValues(monthlyData);
      } else if (filter === "thisMonth") {
        const weeklyData = Array(5).fill(0);
        data.transactions.forEach((transaction: any) => {
          const day = new Date(transaction.createdAt).getDate();
          const weekIndex = Math.floor((day - 1) / 7);
          weeklyData[weekIndex] += transaction.amount;
        });
        setChartLabels(["Week 1", "Week 2", "Week 3", "Week 4", "Remaining Days"]);
        setChartDataValues(weeklyData);
      } else if (filter === "today") {
        const hourlyData = Array(12).fill(0);
        data.transactions.forEach((transaction: any) => {
          const hour = new Date(transaction.createdAt).getHours();
          const intervalIndex = Math.floor(hour / 2);
          hourlyData[intervalIndex] += transaction.amount;
        });
        setChartLabels([
          "12AM-2AM", "2AM-4AM", "4AM-6AM", "6AM-8AM", "8AM-10AM",
          "10AM-12PM", "12PM-2PM", "2PM-4PM", "4PM-6PM", "6PM-8PM",
          "8PM-10PM", "10PM-12AM",
        ]);
        setChartDataValues(hourlyData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
    }
  };

  useEffect(() => {
    const today = new Date();
    let filters: any = { type: transactionType, dateRange: "" };

    if (filter === "today") {
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      filters = { type: transactionType, dateRange: "today", startDate: startOfDay, endDate: endOfDay };
    } else if (filter === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      filters = { type: transactionType, dateRange: "thisMonth", startDate: startOfMonth, endDate: endOfMonth };
    } else if (filter === "thisYear") {
      const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString();
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
      filters = { type: transactionType, dateRange: "thisYear", startDate: startOfYear, endDate: endOfYear };
    } else if (filter === "custom") {
      if (!startDate || !endDate) {
        toast.error("Please select both start and end dates.");
        return;
      }
      filters = { type: transactionType, dateRange: "custom", startDate, endDate };
    }

    fetchData(filters);
  }, [filter, transactionType, startDate, endDate]);
  const downloadOrdersPDF = () => {
    const ordersHTML = `
      <div style="font-family: Arial, sans-serif; padding: 0px;">
        <h1 style="font-size: 20px;">Orders Report</h1>
        <h3 style="font-size: 20px;">Total Orders: ${salesData.length}</h3>
        <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${orders
              .map(
                (transaction) => `
              <tr>
                <td>${transaction.description || "N/A"}</td>
                <td>Rs. ${transaction.amount.toFixed(2)}</td>
                <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
              </tr>
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
      .from(ordersHTML)
      .set(options)
      .save()
      .catch((error: any) => {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF.");
      });
  };
  

  const downloadPDF = () => {
    const reportHTML = `
      <div style="font-family: Arial, sans-serif; padding: 0px;">
        <h1 style="font-size: 20px;">${transactionType}s Report</h1>
        <h3 style="font-size: 20px;">Total ${transactionType}: Rs. ${totalAmount.toFixed(2)}</h3>
        <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Detail</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (transaction) => `
              <tr>
                <td>${transaction.description || "N/A"}</td>
                <td>Rs. ${transaction.amount.toFixed(2)}</td>
                <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const options = {
      margin: 0.25,
      filename: `${filter}_${transactionType}_report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .from(reportHTML)
      .set(options)
      .save()
      .catch((error:any) => {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF.");
      });
  };

  // const chartData = {
  //   labels: chartLabels,
  //   datasets: [
  //     {
  //       label: `Sales (${filter})`,
  //       data: chartDataValues,
  //       backgroundColor: "rgba(75, 192, 192, 0.2)",
  //       borderColor: "rgba(75, 192, 192, 1)",
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: { position: "top" },
  //     title: { display: true, text: `Sales Chart (${filter})` },
  //   },
  // };

  return (
//     <div className="home-page">
//       <div className="filter-section">
//         <label>Filter by:</label>
//         <select
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//           className="filter-select"
//         >
//           <option value="today">Today</option>
//           <option value="thisMonth">This Month</option>
//           <option value="thisYear">This Year</option>
//           <option value="custom">Custom</option>
//         </select>
//         {filter === "custom" && (
//           <div className="custom-date-section">
//             <label>Start Date:</label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="date-input"
//             />
//             <label>End Date:</label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="date-input"
//             />
//           </div>
//         )}
//       </div>

//       {/* Total Sales Box */}
//       <div style={{ backgroundColor: "#f4f4f4", border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", maxWidth: "300px", margin: "20px auto" }}>
//         <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Total Sales</h3>
//         <p style={{ fontSize: "18px", fontWeight: "bold" }}>Rs. {totalSales.toFixed(2)}</p>
//       </div>

//       <div style={{ maxWidth: "800px", margin: "20px auto" }}>
//         <Bar data={chartData} options={chartOptions} /> 
//       </div>

//       <div className="actions-section">
//   <button onClick={downloadPDF} className="download-button gen-button">
//     Download Sales Report
//   </button>
//   <button onClick={downloadOrdersPDF} className="download-button gen-button">
//     Download Orders
//   </button>
// </div>

//     </div>

<div>
<div>
  <label>Transaction Type:</label>
  <select
    value={transactionType}
    onChange={(e) => setTransactionType(e.target.value)}
  >
    <option value="sale">Sales</option>
    <option value="investment">Investments</option>
    <option value="expense">Expenses</option>
  </select>

  <label>Filter by:</label>
  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
  >
    <option value="today">Today</option>
    <option value="thisMonth">This Month</option>
    <option value="thisYear">This Year</option>
    <option value="custom">Custom</option>
  </select>
</div>

{filter === "custom" && (
  <div>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
    />
  </div>
)}

<Bar data={{
  labels: chartLabels,
  datasets: [
    {
      label: `${transactionType} (${filter})`,
      data: chartDataValues,
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
}} />

<p>Total {transactionType}: {totalAmount}</p>

<div className="actions-section">
   <button onClick={downloadPDF} className="download-button gen-button">
     Download Transaction Report
   </button>
   
 </div>
</div>
  );
};
export default Home;
