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

export default function DeliveredOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/all");
      const json = await res.json();

      if (json.success && Array.isArray(json.orders)) {
        const delivered = json.orders.filter(
          (o: any) => o.deliveryStatus === "delivered"
        );
        setOrders(delivered);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load delivered orders", err);
      toast.error("Failed to fetch delivered orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-5 border rounded-2xl mt-6">
      <h2 className="text-xl font-semibold mb-4">Delivered Orders</h2>

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
                <td className="px-4 py-2">{o.deliveryStatus}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No delivered orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
