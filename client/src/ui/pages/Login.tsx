import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "./styles/login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // Track login errors
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission
    console.log("clicked");
    try {
      const response = await axiosInstance.post('/login', { email, password });
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Logged in:', response.data);
        setError(null); // Clear errors on success
        navigate('/stock'); // Navigate to home page
      } else {
        console.error('Unexpected response:', response.status);
        setError('Unexpected error. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Display error message if login fails */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
