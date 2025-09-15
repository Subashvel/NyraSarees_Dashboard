import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface OrderItem {
  id: number;
  orderId: string;
  orderDate: string;
  Bill: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
  };
  paymentStatus: "unpaid" | "paid";
  deliveryStatus: "dispatch" | "packing" | "outfordelivery" | "delivered";
}

export default function DispatchOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState("outfordelivery");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/all");
      const json = await res.json();

      if (json.success && Array.isArray(json.orders)) {
        const dispatch = json.orders.filter(
          (o: any) => o.deliveryStatus === "dispatch"
        );
        setOrders(dispatch);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load dispatch orders", err);
      toast.error("Failed to fetch dispatch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryStatus: status }),
        }
      );
      const json = await res.json();

      if (json.success) {
        toast.success("Order updated successfully!");
        setShowModal(false);
        fetchOrders(); // refresh list so it disappears from Dispatch table
      } else {
        toast.error("Failed to update order");
      }
    } catch (err) {
      console.error("Error updating order", err);
      toast.error("Error updating order");
    }
  };

  if (loading) return <p>Loading...</p>;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-700 border border-green-300";
      case "unpaid":
        return "text-red-700 border border-red-300";
      case "dispatch":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      case "packing":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "outfordelivery":
        return "bg-orange-100 text-orange-700 border border-orange-300";
      case "delivered":
        return "text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  return (
    <div className="p-5 border rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Dispatch Orders</h2>

      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Ordered Date</th>
            <th className="px-4 py-2">Customer Name</th>
            <th className="px-4 py-2">Address</th>
            <th className="px-4 py-2">Payment Status</th>
            <th className="px-4 py-2">Delivery Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length ? (
            orders.map((o, i) => (
              <tr key={o.id} className="border-b">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{o.orderId}</td>
                <td className="px-4 py-2">
                  {new Date(o.orderDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{o.Bill?.fullName || "N/A"}</td>
                <td className="px-4 py-2">
                  {[o.Bill?.addressLine1, o.Bill?.addressLine2]
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${getStatusClass(
                      o.paymentStatus
                    )}`}
                  >
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(o);
                      setShowModal(true);
                    }}
                    className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Status
                  </button>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <a
                    href={`${window.location.origin}/invoice/${o.orderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    View
                  </a>
                  
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4">
                No dispatch orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 ccc sss">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            <p>Order ID: {selectedOrder.orderId}</p>
      <p>Customer: {selectedOrder.Bill?.fullName || "N/A"}</p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="outfordelivery">Out For Delivery</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  updateOrderStatus(selectedOrder.id, newStatus)
                }
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
