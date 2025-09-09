import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { getLowStockProducts } from "../ProductVariant/productLowStockApi";

export default function NotificationDropdown() {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [notifying, setNotifying] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const items = await getLowStockProducts(); // ✅ only one source
        setLowStockItems(Array.isArray(items) ? items : []);
        setNotifying(items.length > 0);
      } catch (err) {
        console.error("❌ Failed to fetch low stock items:", err);
        setLowStockItems([]);
        setNotifying(false);
      }
    };

    fetchLowStock();
  }, []);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {notifying && (
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800">Low Stock Alerts</h3>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500">No low stock items</p>
            ) : (
              <ul className="mt-2 max-h-64 overflow-y-auto divide-y divide-gray-200">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="py-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {item.Product?.productName} - {item.variantName}
                    </span>
                    <span className="text-sm text-red-600">
                      {item.Stock?.availableStock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
