import { useEffect, useState } from "react";
import { addStock, reduceStock } from "./productStockApi";
import toast from "react-hot-toast";

interface Stock {
  stockId: number;
  productVariantId: number;
  availableStock: number;
  soldStock: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Variant {
  productVariantId: number;
  categoryName?: string;
  productName?: string;
  stock?: number;
  soldStock?: number;
}

export default function ProductStock() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "reduce" | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/product-variants", {
        headers: { Accept: "application/json" },
      }).then((res) => res.json()),
      fetch("http://localhost:5000/api/product-stock", {
        headers: { Accept: "application/json" },
      }).then((res) => res.json()),
    ])
      .then(([variantsData, stockData]) => {
        const variantsArray = Array.isArray(variantsData)
          ? variantsData
          : variantsData.data || [];

        const stockArray = Array.isArray(stockData)
          ? stockData
          : stockData.data || [];

        const variantsWithStock = variantsArray.map((variant: any) => {
          const variantId = variant.productVariantId || variant.id;
          const stockItem = stockArray.find(
            (s: Stock) => s.productVariantId === variantId
          );

          return {
            productVariantId: variantId,
            productName: variant.Product?.productName || "N/A",
            categoryName:
              variant.Product?.SubCategory?.Category?.categoryName || "N/A",
            stock: stockItem ? stockItem.availableStock : 0,
            soldStock: stockItem ? stockItem.soldStock : 0,
          };
        });

        setVariants(variantsWithStock);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openModal = (variant: Variant, type: "add" | "reduce") => {
    setSelectedVariant(variant);
    setModalType(type);
    setQuantity("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
    setQuantity("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      setError("Enter a valid quantity");
      return;
    }

    try {
      if (modalType === "add" && selectedVariant) {
        await addStock(selectedVariant.productVariantId, Number(quantity));
        toast.success("Stock added successfully!");
      } else if (modalType === "reduce" && selectedVariant) {
        await reduceStock(selectedVariant.productVariantId, Number(quantity));
        toast.success("Stock reduced successfully!");
      }

      // Refresh stock list
      const res = await fetch("http://localhost:5000/api/product-stock");
      const stockJson = await res.json();
      const stockArray = Array.isArray(stockJson)
        ? stockJson
        : stockJson.data || [];

      setVariants((prev) =>
        prev.map((v) => {
          const updatedStock = stockArray.find(
            (s: Stock) => s.productVariantId === v.productVariantId
          );
          return {
            ...v,
            stock: updatedStock ? updatedStock.availableStock : v.stock,
            soldStock: updatedStock ? updatedStock.soldStock : v.soldStock,
          };
        })
      );

      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stock");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Stock Management</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">S.No</th>
            <th className="p-2 border">Category Name</th>
            <th className="p-2 border">Product Name</th>
            <th className="p-2 border">Available Stock</th>
            <th className="p-2 border">Sold Stock</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.length > 0 ? (
            variants.map((variant, index) => (
              <tr key={variant.productVariantId}>
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{variant.categoryName}</td>
                <td className="p-2 border">{variant.productName}</td>
                <td className="p-2 border text-center">{variant.stock ?? 0}</td>
                <td className="p-2 border text-center">{variant.soldStock ?? 0}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => openModal(variant, "add")}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    + Add
                  </button>

                  <button
                    onClick={() => openModal(variant, "reduce")}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    - Reduce
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-2 text-center">
                No product variants found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedVariant && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "add" ? "Add Stock" : "Reduce Stock"}
            </h3>

            {modalType === "reduce" && (
              <div className="mb-3">
                <label className="block font-medium">Available Stock</label>
                <input
                  type="number"
                  value={selectedVariant.stock ?? 0}
                  disabled
                  className="border w-full p-2 rounded bg-gray-100"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="block font-medium">Stock Quantity*</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuantity(value);

                  if (!value) {
                    setError("Stock Quantity is required");
                  } else if (!/^\d+$/.test(value)) {
                    setError("Stock Quantity should only be number");
                  } else if (
                    modalType === "reduce" &&
                    selectedVariant &&
                    parseInt(value) > (selectedVariant.stock ?? 0)
                  ) {
                    setError(
                      "Stock Quantity should not be more than Available stock"
                    );
                  } else {
                    setError("");
                  }
                }}
                className="border w-full p-2 rounded"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >
                {modalType === "add"
                  ? "Add Quantity"
                  : "Reduce Quantity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
