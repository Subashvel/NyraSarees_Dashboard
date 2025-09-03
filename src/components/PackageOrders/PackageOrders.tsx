import { useState, useEffect } from "react";
import toast from "react-hot-toast";
// import { getOrders } from "./orderApi";

interface OrderItem {
  address: string;
  customerName: string;
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


export default function PackageOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
const [showModal, setShowModal] = useState(false);
const [deliveryStatus, setDeliveryStatus] = useState("");

const updateOrderStatus = async (id: number, dStatus: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryStatus: dStatus }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Order moved to dispatch");
      fetchOrders(); // Refresh table after update
    } else {
      toast.error("Failed to update status");
    }
  } catch {
    toast.error("Update failed");
  }
};

const openModal = (order: OrderItem) => {
  setSelectedOrder(order);
  setShowModal(true);
};

const handleDispatchUpdate = () => {
  if (selectedOrder) {
    updateOrderStatus(selectedOrder.id, "dispatch");
    setShowModal(false);
  }
};


  useEffect(() => {
  fetchOrders();
}, []);

const fetchOrders = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/orders/all");
    const json = await res.json();
    if (json.success) {
      // Filter only packing orders
      const filtered = json.orders.filter(
        (o: any) => o.deliveryStatus === "packing"
      );
      setOrders(filtered);
    } else {
      setOrders([]);
    }
  } catch (err) {
    toast.error("Failed to fetch package orders");
  } finally {
    setLoading(false);
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
      <h2 className="text-xl font-semibold mb-4">Package Orders</h2>

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
              <tr key={o.orderId} className="border-b">
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
    onClick={() => openModal(o)}
    className="bg-yellow-400 px-3 py-1 rounded text-sm"
  >
    Status
  </button>
</td>


<td className="px-4 py-2">
  <a
    href={`${window.location.origin}/invoice/${o.id}`}
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
              <td colSpan={6} className="text-center py-4">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ccc sss">
    <div className="bg-white rounded p-6 w-[400px]">
      <h3 className="text-lg font-semibold mb-4">Update Delivery Status</h3>
      <p>Order ID: {selectedOrder.orderId}</p>
      <p>Customer: {selectedOrder.Bill?.fullName || "N/A"}</p>

      <select
        value={deliveryStatus}
        onChange={(e) => setDeliveryStatus(e.target.value)}
        className="border rounded p-2 w-full mt-3"
      >
        <option value="">Select status</option>
        <option value="dispatch">Dispatch</option>
      </select>

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleDispatchUpdate}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={!deliveryStatus}
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
