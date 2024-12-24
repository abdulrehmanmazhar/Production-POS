// components/Layout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "./styles/Layout.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const Layout = () => {
  return (
    <div className="layout">
      <Navbar />
      <div className="content">
      <ToastContainer />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
