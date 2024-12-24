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
  FaClipboardList, // Icon for Orders
  FaUsers, // Icon for Community
} from "react-icons/fa";

const Navbar = () => {
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
    </nav>
  );
};

const styles = {
  nav: {
    width: "200px",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRight: "1px solid #ccc",
    height: "100vh",
  },
  ul: {
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  li: {
    marginBottom: "20px",
  },
  link: {
    textDecoration: "none",
    color: "#333",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
  },
  icon: {
    marginRight: "10px", // Space between the icon and text
    fontSize: "20px", // Adjust the icon size
  },
};

export default Navbar;
