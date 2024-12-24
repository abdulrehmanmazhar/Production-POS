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
import Login from "./pages/Login";
import Verification from "./pages/Verification";
import Customer from "./pages/Customer";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Orders from "./pages/Orders";
import Community from "./pages/Community";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Routes with Navbar */}
        <Route path="/" element={<Layout />}>
        <Route element={<ProtectedRoutes/>}>
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
        </Route>

        {/* Routes without Navbar */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verification" element={<Verification />} />
      </Routes>
    </Router>
  );
};

export default App;
