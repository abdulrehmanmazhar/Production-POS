import React, { useState, useEffect } from "react";
import "./styles/Customer.css";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role?: string;
}

const Community = () => {
  const [view, setView] = useState<"add" | "list">("add");
  const [users, setUsers] = useState<IUser[]>([]);
  const [newUser, setNewUser] = useState<IUser>({ name: "", email: "", password: "" });

  useEffect(() => {
    if (view === "list") fetchUsers();
  }, [view]);

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get("/get-all-users-admin");
      const filteredUser = data.users.filter((user:any)=>user.role !=="admin")
      setUsers(filteredUser);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrEditUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      if (newUser._id) {
        await axiosInstance.put(`/update-user-info/${newUser._id}`, newUser);
        toast.success("User updated successfully.");
      } else {
        await axiosInstance.post("/add-user-admin", newUser);
        toast.success("User added successfully.");
      }
      setNewUser({ name: "", email: "", password: "" });
      setView("list");
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.response?.data?.message || "Failed to save user.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axiosInstance.delete(`/delete-user/${id}`);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleEditUser = (id: string) => {
    const userToEdit = users.find((user) => user._id === id);
    if (userToEdit) {
      setNewUser(userToEdit);
      setView("add");
    }
  };

  return (
    <div className="user-page">
      {/* Top bar */}
      <div className="top-bar">
        <button
          className={`top-bar-button ${view === "add" ? "active" : ""}`}
          onClick={() => setView("add")}
        >
          Add New User
        </button>
        <button
          className={`top-bar-button ${view === "list" ? "active" : ""}`}
          onClick={() => setView("list")}
        >
          User List
        </button>
      </div>

      {/* Dynamic content */}
      {view === "add" ? (
        <div className="create-user">
          <h2>{newUser._id ? "Edit User" : "Create New User"}</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Enter email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleInputChange}
              placeholder="Enter password"
            />
          </div>
          <button className="add-button" onClick={handleAddOrEditUser}>
            {newUser._id ? "Update User" : "Add User"}
          </button>
        </div>
      ) : (
        <div className="user-list">
          <h2>User List</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="edit-button" onClick={() => handleEditUser(user._id!)} >
                      Edit
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteUser(user._id!)} >
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
