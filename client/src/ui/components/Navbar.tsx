// @ts-nocheck
import { Link } from "react-router-dom";
import "./styles/Navbar.css";
import {
  FaHome,
  FaBox,
  FaChartBar,
  FaMoneyBill,
  FaCreditCard,
  FaReceipt,
  FaShoppingCart,
  FaUser,
  FaClipboardList,
  FaUsers,
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

const Navbar = () => {
  const logoutHandler = async () => {
    try {
      const response = await axiosInstance.get('/logout');
      toast.success("Logged out successfully.");
    } catch (error) {
      toast.error("Failed to log out.",error);
    }
  }
  return (
    <nav className="vertical-navbar" style={styles.nav}>
      <ul style={styles.ul}>
        <li style={styles.li}>
          <Link to="/" style={styles.link}>
            <FaHome style={styles.icon} />
            Home
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/product" style={styles.link}>
            <FaBox style={styles.icon} />
            Product
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/stock" style={styles.link}>
            <FaChartBar style={styles.icon} />
            Stock
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/expense" style={styles.link}>
            <FaMoneyBill style={styles.icon} />
            Expense
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/credits" style={styles.link}>
            <FaCreditCard style={styles.icon} />
            Credits
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/bills" style={styles.link}>
            <FaReceipt style={styles.icon} />
            Bills
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/sell" style={styles.link}>
            <FaShoppingCart style={styles.icon} />
            Sell
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/customer" style={styles.link}>
            <FaUser style={styles.icon} />
            Customer
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/orders" style={styles.link}>
            <FaClipboardList style={styles.icon} />
            Orders
          </Link>
        </li>
        <li style={styles.li}>
          <Link to="/community" style={styles.link}>
            <FaUsers style={styles.icon} />
            Community
          </Link>
        </li>
      </ul>
      <button style={styles.logoutButton} onClick={logoutHandler}>Logout</button>
    </nav>
  );
};

const styles = {
  nav: {
    width: "180px",
    padding: "15px",
    backgroundColor: "#f4f4f4",
    borderRight: "1px solid #ccc",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-around",
    gap: "0rem",
  },
  ul: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
    marginBottom: "40px", // Push the button upward
  },
  li: {
    marginBottom: "12px",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: "8px",
    fontSize: "18px",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    padding: "10px 15px",
    fontSize: "14px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    // alignSelf: "center",
    // marginBottom: "40px", // Ensure it's visible above shorter screens
  },
};

export default Navbar;
