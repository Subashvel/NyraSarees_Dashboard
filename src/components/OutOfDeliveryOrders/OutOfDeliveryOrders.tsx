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

export default function OutForDeliveryOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/all");
      const json = await res.json();

      if (json.success && Array.isArray(json.orders)) {
        const outForDelivery = json.orders.filter(
          (o: any) => o.deliveryStatus === "outfordelivery"
        );
        setOrders(outForDelivery);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load out for delivery orders", err);
      toast.error("Failed to fetch out for delivery orders");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update delivery status
  const handleDelivery = async () => {
    if (!selectedOrder) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${selectedOrder.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryStatus: newStatus }),
        }
      );
      const json = await res.json();

      if (json.success) {
        toast.success("Order status updated");
        fetchOrders(); // refresh orders
        setSelectedOrder(null);
        setNewStatus("");
        setShowModal(false); // close modal
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status", err);
      toast.error("Error updating status");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-5 border rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Out For Delivery Orders</h2>

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
                <td className="px-4 py-2">{o.paymentStatus}</td>

                {/* ✅ Delivery Status column with button */}
                <td className="px-4 py-2">
                  {/* {o.deliveryStatus} */}
                  {/* <br /> */}
                  <button
                    onClick={() => {
                      setSelectedOrder(o);
                      setShowModal(true);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm mt-1"
                  >
                    Update Status
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
              <td colSpan={7} className="text-center py-4">
                No out for delivery orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ccc sss">
          <div className="bg-white rounded p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              Update Delivery Status
            </h3>
            <p>Order ID: {selectedOrder.orderId}</p>
            <p>Customer: {selectedOrder.Bill?.fullName || "N/A"}</p>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border rounded p-2 w-full mt-3"
            >
              <option value="">Select status</option>
              <option value="delivered">Delivered</option>
            </select>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelivery}
                className="px-4 py-2 bg-green-600 text-white rounded"
                disabled={!newStatus}
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
