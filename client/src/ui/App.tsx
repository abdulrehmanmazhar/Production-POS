import { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Product from "./pages/Product";
import Stock from "./pages/Stock";
import Expense from "./pages/Expense";
import Credits from "./pages/Credits";
import Bills from "./pages/Bills";
import Sell from "./pages/Sell";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Verification from "./pages/Verification";
import Customer from "./pages/Customer";
import Orders from "./pages/Orders";
import Community from "./pages/Community";
import Login from "./pages/Login";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div>
        {/* Display login modal if the user is not authenticated */}
        {!isAuthenticated && (
          <div className="login-modal">
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        )}

        {/* Main application */}
        {isAuthenticated && (
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product" element={<Product />} />
              <Route path="stock" element={<Stock />} />
              <Route path="expense" element={<Expense />} />
              <Route path="credits" element={<Credits />} />
              <Route path="bills" element={<Bills />} />
              <Route path="sell" element={<Sell />} />
              <Route path="customer" element={<Customer />} />
              <Route path="orders" element={<Orders />} />
              <Route path="community" element={<Community />} />
            </Route>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verification" element={<Verification />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
