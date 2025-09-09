import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductDetailsPage from "./ProductDetails";
import { useParams, useNavigate } from "react-router-dom";

interface OrderResponse {
  success: boolean;
  order: any;
}

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null); // 👈 store full product snapshot

  useEffect(() => {
    if (!id) return;
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`);
      const data: OrderResponse = await res.json();
      if (data.success) setOrder(data.order);
      else toast.error("Order not found");
    } catch {
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>No order found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Top Buttons */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => navigate("/product-orders")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🖨️ Print
        </button>
      </div>

      {/* Invoice Details */}
      <h2 className="text-2xl font-semibold mb-4">
        Invoice Number - {order.orderId}
      </h2>
      <p>Customer Name : {order.Bill?.fullName}</p>
<p>Customer Email Id: {order.Bill?.email}</p>
<p>Customer Phone Number: {order.Bill?.phoneNo}</p>
<p>
  Customer Address:{" "}
  {[order.Bill?.addressLine1, order.Bill?.addressLine2].filter(Boolean).join(", ")}
</p>

<h3 className="mt-6 text-xl font-semibold">Items</h3>
<table className="w-full border mt-2">
  <thead>
    <tr className="bg-gray-100">
      <th className="p-2 border">Product Image</th>
      <th className="p-2 border">Product Name</th>
      <th className="p-2 border">Product Qty</th>
      <th className="p-2 border">Product Price</th>
    </tr>
  </thead>
  <tbody>
    {order.OrderSlots?.map((item: any) => (
      <tr key={item.id}>
        <td className="p-2 border">
          {item.product_variant_image ? (
            <img
              src={`http://localhost:5000/uploads/${item.product_variant_image}`}
              alt={item.productname}
              className="w-16 h-16 object-cover rounded cursor-pointer"
              onClick={() => setSelectedProduct(item)}
            />
          ) : (
            "No Image"
          )}
        </td>
        <td className="p-2 border">{item.productname}</td>
        <td className="p-2 border">{item.quantity}</td>
        <td className="p-2 border">₹{item.product_price}</td>
        
      </tr>
    ))}
  </tbody>
</table>

      <p className="mt-4 font-semibold">
        Grand Total: ₹{order.grand_total_amount}
      </p>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] overflow-auto relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-2 right-2 text-red-500"
            >
              ✕
            </button>
            <ProductDetailsPage product={selectedProduct} /> {/* 👈 pass snapshot */}
          </div>
        </div>
      )}
    </div>
  );
}
