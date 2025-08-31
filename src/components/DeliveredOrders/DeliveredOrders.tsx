import { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { getOrders } from "./orderApi";

interface OrderItem {
  orderId: number;
  orderedDate: string;
  customerName: string;
  address: string;
  paymentStatus: "Pending" | "Paid" | "Failed";
}


export default function DeliveredOrders() {
  const [orders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetchOrders();
    setLoading(false);
    
  }, []);

  // const fetchOrders = async () => {
  //   try {
  //     const json = await getOrders();
  //     if (json.success && Array.isArray(json.data)) {
  //       setOrders(json.data);
  //     } else {
  //       setOrders([]);
  //     }
  //   } catch (err) {
  //     console.error("Failed to load orders", err);
  //     toast.error("Failed to fetch orders");
  //   }
  // };
  if (loading) return <p>Loading...</p>;
  return (
    <div className="p-5 border rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Product Delivered Orders</h2>

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
              <tr key={o.orderId} className="border-b">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{o.orderId}</td>
                <td className="px-4 py-2">{o.orderedDate}</td>
                <td className="px-4 py-2">{o.customerName}</td>
                <td className="px-4 py-2">{o.address}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    o.paymentStatus === "Paid"
                      ? "text-green-600"
                      : o.paymentStatus === "Pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {o.paymentStatus}
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
    </div>
  );
}
