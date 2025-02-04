import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";

const ProtectedRoutes = () => {
  const { user } = useContext(AuthContext);
 console.log(user)
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
