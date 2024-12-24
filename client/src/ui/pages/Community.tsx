import React, { useState, useEffect } from "react";
import "./styles/Customer.css";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

interface ICustomer {
  _id?: string;
  name: string;
  address: string;
  contact: string;
  orders?: string[];
  udhar?: number;
}

const Community = () => {
  const [view, setView] = useState<"add" | "list">("add");
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [newCustomer, setNewCustomer] = useState<ICustomer>({ name: "", contact: "", address: "" });

  useEffect(() => {
    if (view === "list") fetchCustomers();
  }, [view]);

  const fetchCustomers = async () => {
    try {
      const { data } = await axiosInstance.get("/get-customers");
      setCustomers(data.customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrEditCustomer = async () => {
    if (!newCustomer.name || !newCustomer.contact || !newCustomer.address) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      if (newCustomer._id) {
        await axiosInstance.put(`/edit-customer/${newCustomer._id}`, newCustomer);
        toast.success("Customer updated successfully.");
      } else {
        await axiosInstance.post("/add-customer", newCustomer);
        toast.success("Customer added successfully.");
      }
      setNewCustomer({ name: "", contact: "", address: "" });
      setView("list");
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast.error(error.response?.data?.message || "Failed to save customer.");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await axiosInstance.delete(`/delete-customer/${id}`);
      toast.success("Customer deleted successfully.");
      fetchCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast.error(error.response?.data?.message || "Failed to delete customer.");
    }
  };

  const handleEditCustomer = (id: string) => {
    const customerToEdit = customers.find((customer) => customer._id === id);
    if (customerToEdit) {
      setNewCustomer(customerToEdit);
      setView("add");
    }
  };

  return (
    <div className="customer-page">
      {/* Top bar */}
      <div className="top-bar">
        <button
          className={`top-bar-button ${view === "add" ? "active" : ""}`}
          onClick={() => setView("add")}
        >
          Add Customer
        </button>
        <button
          className={`top-bar-button ${view === "list" ? "active" : ""}`}
          onClick={() => setView("list")}
        >
          Customer List
        </button>
      </div>

      {/* Dynamic content */}
      {view === "add" ? (
        <div className="create-customer">
          <h2>{newCustomer._id ? "Edit Customer" : "Create New Customer"}</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              placeholder="Enter customer's name"
            />
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input
              type="text"
              name="contact"
              value={newCustomer.contact}
              onChange={handleInputChange}
              placeholder="Enter customer's contact"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={newCustomer.address}
              onChange={handleInputChange}
              placeholder="Enter customer's address"
            />
          </div>
          <button className="add-button" onClick={handleAddOrEditCustomer}>
            {newCustomer._id ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      ) : (
        <div className="customer-list">
          <h2>Customer List</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.contact}</td>
                  <td>{customer.address}</td>
                  <td>
                    <button className="edit-button" onClick={() => handleEditCustomer(customer._id!)}>
                      Edit
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteCustomer(customer._id!)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Community;
