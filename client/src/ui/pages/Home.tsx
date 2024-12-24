// @ts-nocheck

import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registering chart.js components
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [salesData, setSalesData] = useState<Transaction[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartDataValues, setChartDataValues] = useState<number[]>([]);

  const fetchSalesData = async (filters: Filters) => {
    try {
      const { data } = await axiosInstance.post("/get-sales", filters);
      setSalesData(data.transactions);

      // Calculate total sales
      const total = data.transactions.reduce(
        (sum: number, transaction: Transaction) => sum + transaction.amount,
        0
      );
      setTotalSales(total);

      if (filter === "thisYear") {
        const salesByMonth: number[] = Array(12).fill(0);
        data.transactions.forEach((transaction: Transaction) => {
          const month = new Date(transaction.createdAt).getMonth();
          salesByMonth[month] += transaction.amount;
        });
        setChartLabels([
          "January", "February", "March", "April", "May", "June", "July", "August", 
          "September", "October", "November", "December"
        ]);
        setChartDataValues(salesByMonth);
      } else if (filter === "thisMonth") {
        // const today = new Date();
        // const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const weeklySales: number[] = Array(5).fill(0);
        data.transactions.forEach((transaction: Transaction) => {
          const day = new Date(transaction.createdAt).getDate();
          const weekIndex = Math.floor((day - 1) / 7);
          weeklySales[weekIndex] += transaction.amount;
        });
        setChartLabels(["Week 1", "Week 2", "Week 3", "Week 4", "Remaining Days"]);
        setChartDataValues(weeklySales);
      } else if (filter === "today") {
        const hourlySales: number[] = Array(12).fill(0);
        data.transactions.forEach((transaction: Transaction) => {
          const hour = new Date(transaction.createdAt).getHours();
          const intervalIndex = Math.floor(hour / 2);
          hourlySales[intervalIndex] += transaction.amount;
        });
        setChartLabels([
          "12AM-2AM", "2AM-4AM", "4AM-6AM", "6AM-8AM", "8AM-10AM", "10AM-12PM", 
          "12PM-2PM", "2PM-4PM", "4PM-6PM", "6PM-8PM", "8PM-10PM", "10PM-12AM"
        ]);
        setChartDataValues(hourlySales);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Failed to fetch sales data.");
    }
  };

  useEffect(() => {
    const today = new Date();
    let filters: Filters = { type: "sale", dateRange: "" };

    if (filter === "today") {
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      filters = { type: "sale", dateRange: "today", startDate: startOfDay, endDate: endOfDay };
    } else if (filter === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
      filters = { type: "sale", dateRange: "thisMonth", startDate: startOfMonth, endDate: endOfMonth };
    } else if (filter === "thisYear") {
      const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString();
      const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
      filters = { type: "sale", dateRange: "thisYear", startDate: startOfYear, endDate: endOfYear };
    } else if (filter === "custom") {
      if (!startDate || !endDate) {
        toast.error("Please select both start and end dates.");
        return;
      }
      filters = { type: "sale", dateRange: "custom", startDate, endDate };
    }

    fetchSalesData(filters);
  }, [filter, startDate, endDate]);

  const downloadPDF = () => {
    const reportHTML = `
      <div style="font-family: Arial, sans-serif; padding: 0px;">
        <h1 style="font-size: 20px;">Sales Report</h1>
        <h3 style="font-size: 20px;">Total Sales: Rs. ${totalSales.toFixed(2)}</h3>
        <table border="1" cellspacing="0" cellpadding="5" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${salesData
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
      filename: `${filter}_sales_report.pdf`,
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

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `Sales (${filter})`,
        data: chartDataValues,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Sales Chart (${filter})` },
    },
  };

  return (
    <div className="home-page">
      <div className="filter-section">
        <label>Filter by:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="today">Today</option>
          <option value="thisMonth">This Month</option>
          <option value="thisYear">This Year</option>
          <option value="custom">Custom</option>
        </select>
        {filter === "custom" && (
          <div className="custom-date-section">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
        )}
      </div>

      {/* Total Sales Box */}
      <div style={{ backgroundColor: "#f4f4f4", border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", maxWidth: "300px", margin: "20px auto" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Total Sales</h3>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>Rs. {totalSales.toFixed(2)}</p>
      </div>

      <div style={{ maxWidth: "800px", margin: "20px auto" }}>
        <Bar data={chartData} options={chartOptions} /> 
      </div>

      <div className="actions-section">
        <button onClick={downloadPDF} className="download-button">
          Download Report
        </button>
      </div>
    </div>
  );
};

export default Home;
