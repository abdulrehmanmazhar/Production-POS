import React from 'react';

type Props = {
  totalSales: number;
  salesData: Array<{
    _id: string;
    description: string;
    amount: number;
    createdAt: string;
  }>;
};

const SalesReport: React.FC<Props> = ({ totalSales, salesData }) => {
  return (
    <>
      {/* Total Sales Box */}
      <div
        className="total-sales-box"
        style={{
          marginBottom: "20px",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "5px",
          backgroundColor: "#f9f9f9",
          textAlign: "center",
        }}
      >
        <h3>Total Sales: {totalSales?.toFixed(2) || 0} PKR</h3>
      </div>

      {/* Sales Data Table */}
      {salesData.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="sales-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((transaction) => (
              <tr key={transaction._id}>
                <td>{transaction.description}</td>
                <td>{transaction.amount}</td>
                <td>{new Date(transaction.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default SalesReport;
