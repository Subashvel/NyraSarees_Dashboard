import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface OrderItem {
  id: number;
  orderId: string;
  orderDate: string;
  customerName: string;
  phoneNo: string;
  totalItems: number;
  stockQuantity: number;
  totalValue: number;
  deliveryStatus: string;
  paymentStatus: string;
}

export default function OrdersReport() {
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
        const mappedOrders: OrderItem[] = json.orders.map((o: any) => {
          const totalItems = o.OrderSlots.length;
          const stockQuantity = o.OrderSlots.reduce(
            (sum: number, slot: any) => sum + slot.quantity,
            0
          );

          return {
            id: o.id,
            orderId: o.orderId,
            orderDate: o.orderDate,
            customerName: o.Bill?.fullName || "N/A",
            phoneNo: o.Bill?.phoneNo || "N/A",
            totalItems,
            stockQuantity,
            totalValue: o.grand_total_amount,
            deliveryStatus: o.deliveryStatus,
            paymentStatus: o.paymentStatus,
          };
        });

        setOrders(mappedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, o) => sum + o.totalValue, 0);

  // ✅ Export to Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "OrdersReport.xlsx");
  };

  // ✅ Export to PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 16);
    const tableData = orders.map((o, i) => [
      i + 1,
      o.orderId,
      new Date(o.orderDate).toLocaleDateString(),
      o.customerName,
      o.phoneNo,
      o.totalItems,
      o.stockQuantity,
      `₹${o.totalValue}`,
      o.deliveryStatus,
      o.paymentStatus,
    ]);
    (doc as any).autoTable({
      head: [
        [
          "S.No",
          "Order ID",
          "Order Date",
          "Customer Name",
          "Mobile",
          "Total Items",
          "Total Quantity",
          "Total Value",
          "Delivery Status",
          "Payment Status",
        ],
      ],
      body: tableData,
      startY: 22,
    });
    doc.save("OrdersReport.pdf");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-5 border rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Orders Report</h2>

      {/* Summary */}
      <div className="flex gap-4 mb-4">
        <div className="bg-blue-100 px-4 py-2 rounded">
          Total Orders: {totalOrders}
        </div>
        <div className="bg-green-100 px-4 py-2 rounded">
          Total Order Value: ₹{totalValue}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={downloadExcel}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Download Excel
        </button>
        {/* <button
          onClick={downloadPDF}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button> */}
      </div>

      {/* Table */}
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Order ID</th>
            <th className="px-4 py-2">Order Date</th>
            <th className="px-4 py-2">Customer Name</th>
            <th className="px-4 py-2">Mobile</th>
            {/* <th className="px-4 py-2">Total Items</th> */}
            <th className="px-4 py-2">Total Quantity</th>
            <th className="px-4 py-2">Total Value</th>
            <th className="px-4 py-2">Delivery Status</th>
            <th className="px-4 py-2">Payment Status</th>
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
                <td className="px-4 py-2">{o.customerName}</td>
                <td className="px-4 py-2">{o.phoneNo}</td>
                {/* <td className="px-4 py-2">{o.totalItems}</td> */}
                <td className="px-4 py-2">{o.stockQuantity}</td>
                <td className="px-4 py-2">₹{o.totalValue}</td>
                <td className="px-4 py-2">{o.deliveryStatus}</td>
                <td className="px-4 py-2">{o.paymentStatus}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="text-center py-4">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
