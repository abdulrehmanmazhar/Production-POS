import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-toastify';

type Expense = {
  _id?: string; // Optional since new expenses may not have an ID initially
  type: string;
  description: string;
  amount: number;
};

const Expense = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [refreshExpenses, setRefreshExpenses] = useState<boolean>(false); // State to trigger useEffect

  const type = "expense";

  const syncExpenses = () => {
    axiosInstance
      .get("/get-today-transactions")
      .then((response) => {
        setExpenses(response.data.transactions);
      })
      .catch((error) => {
        console.error('Error fetching expenses:', error);
      });
  };

  useEffect(() => {
    syncExpenses();
  }, [refreshExpenses]); // Trigger only on page load or when refreshExpenses changes

  const handleAddExpense = () => {
    if (description.trim() === '' || amount === '' || amount <= 0) {
      alert('Please enter a valid description and amount!');
      return;
    }

    const newExpense: Expense = {
      type,
      description,
      amount: Number(amount),
    };

    axiosInstance
      .post("/create-transaction", newExpense)
      .then(() => {
        toast.success("Expense added successfully");
        setRefreshExpenses((prev) => !prev); // Trigger expense list refresh
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      });

    // Clear form inputs
    setDescription('');
    setAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    axiosInstance
      .delete(`/delete-transaction/${id}`)
      .then(() => {
        toast.success("Expense deleted successfully");
        setRefreshExpenses((prev) => !prev); // Trigger expense list refresh
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "An error occurred");
      });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Heading */}
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Today's Expenses</h2>

      {/* Input Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ flex: 2, marginRight: '10px', padding: '10px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value !== '' ? Number(e.target.value) : '')}
          style={{ flex: 1, marginRight: '10px', padding: '10px' }}
        />
        <button
          onClick={handleAddExpense}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      {/* Expenses List */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {expenses.map((expense) => (
          <li
            key={expense._id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <span style={{ flex: 2 }}>{expense.description}</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Rs. {expense.amount}</span>
            <button
              onClick={() => handleDeleteExpense(expense._id!)}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expense;
