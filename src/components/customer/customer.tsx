import { useEffect, useState } from "react";
// import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getUsers,
  createUser,
  updateUser,
  // deleteUser,
  User, // Import the same interface
} from "./customerApi";

export default function CustomerTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    phonenumber: "",
    email: "",
  });

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open modal for new or edit

  // Handle Create or Update
  const handleSubmit = async () => {
    if (!formData.username || !formData.phonenumber || !formData.email) {
      toast.error("All fields are required");
      return;
    }
  
    try {
      if (editUser?.userId) {
        await updateUser(editUser.userId, formData);
        toast.success("User updated");
      } else {
        await createUser({ ...formData, password: "default123" });
        toast.success("User created");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };
  

  // Delete


  return (
    <div
      className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
    >
      <h2 className="text-xl font-semibold">Customers</h2>
    <div className="p-4">
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customer List</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Customer
        </button>
      </div> */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
              {/* <th className="border p-2">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u.userId} className="text-center">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.phonenumber}</td>
                <td className="px-4 py-2">{u.email}</td>
                {/* <td className="border p-2 space-x-2">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => handleOpenModal(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleDelete(u.userId)}
                  >
                    Delete
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 sss ccc">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-bold mb-4">
              {editUser ? "Edit Customer" : "Add Customer"}
            </h3>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="px-4 py-2"
            />
            <input
              type="text"
              placeholder="Phone"
              value={formData.phonenumber}
              onChange={(e) =>
                setFormData({ ...formData, phonenumber: e.target.value })
              }
              className="px-4 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="px-4 py-2"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                {editUser ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
