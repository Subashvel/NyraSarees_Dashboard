import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "./productVariantApi";
import { getProducts } from "../Products/productApi";
import { getCategories } from "../categories/categoryApi";
import { getSubCategories } from "../subCategories/subCategoryApi";

// --- Interfaces ---
interface CategoryItem {
  categoryId: number;
  categoryName: string;
}

interface SubCategoryItem {
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
}

interface ProductItem {
  productId: number;
  productName: string;
  categoryId: number;
  subCategoryId: number;
}

interface ProductVariantItem {
  productVariantId: number;
  productId: number;
  productColor: string;
  stockQuantity: number;
  lowStock: number;
  thumbImage1?: string;
  thumbImage2?: string;
  thumbImage3?: string;
  thumbImage4?: string;
  Product?: {
    productId: number;
    productName: string;
    categoryId: number;
    subCategoryId: number;
    Category?: CategoryItem;
    SubCategory?: SubCategoryItem;
  };
}

const imageBaseUrl = `http://localhost:5000/uploads/`;

export default function ProductVariants() {
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [form, setForm] = useState<any>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  

  // --- Fetch Data ---
  useEffect(() => {
    fetchVariants();
    fetchCategories();
    fetchSubCategories();
    fetchProducts();
  }, []);

  const fetchVariants = async () => {
    try {
      const json = await getProductVariants();
      if (json.success && Array.isArray(json.data)) {
        // Ensure image URLs are properly prefixed (if needed)
        const updated = json.data.map((variant: ProductVariantItem) => ({
          ...variant,
          thumbImage1: variant.thumbImage1?.startsWith("http")
            ? variant.thumbImage1
            : `${imageBaseUrl}${variant.thumbImage1}`,
          thumbImage2: variant.thumbImage2?.startsWith("http")
            ? variant.thumbImage2
            : `${imageBaseUrl}${variant.thumbImage2}`,
          thumbImage3: variant.thumbImage3?.startsWith("http")
            ? variant.thumbImage3
            : `${imageBaseUrl}${variant.thumbImage3}`,
          thumbImage4: variant.thumbImage4?.startsWith("http")
            ? variant.thumbImage4
            : `${imageBaseUrl}${variant.thumbImage4}`,
        }));
  
        setVariants(updated);
      } else {
        setVariants([]);
      }
    } catch (error) {
      console.error("Error fetching product variants:", error);
      toast.error("Failed to fetch product variants");
    }
  };

  const fetchCategories = async () => {
    try {
      const json = await getCategories();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load subcategories", err);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const json = await getSubCategories();
      if (json.success && Array.isArray(json.data)) {
        setSubCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load subcategories", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const json = await getProducts();
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // --- Filters ---
  const filteredSubCategories = subCategories.filter(
    (sc) => sc.categoryId === Number(form.categoryId || 0)
  );
  const filteredProducts = products.filter(
    (p) => p.subCategoryId === Number(form.subCategoryId || 0)
  );

  // --- Reset ---
  const resetForm = () => {
    setForm({});
    setPreviews({});
    setEditingId(null);
    setShowModal(false);
  };

  // --- Image Change ---
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, [key]: file });
      setPreviews({ ...previews, [key]: URL.createObjectURL(file) });
    }
  };

  // --- Submit ---
  // const handleSubmit = async () => {
  //   try {
  //     const formData = new FormData();
  //     Object.entries(form).forEach(([k, v]) => {
  //       if (v instanceof File) {
  //         formData.append(k, v);
  //       } else if (v !== null && v !== undefined && v !== "") {
  //         formData.append(k, v.toString());
  //       }
  //     });

  //     if (editingId) {
  //       await updateProductVariant(editingId, formData);
  //       toast.success("Variant updated");
  //     } else {
  //       await createProductVariant(formData);
  //       toast.success("Variant created");
  //     }
  //     resetForm();
  //     fetchVariants();
  //   } catch (err) {
  //     console.error("Error submitting form", err);
  //     toast.error("Failed to save variant");
  //   }
  // };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!form.productId) {
        toast.error("Please select a product");
        return;
      }
      if (!form.productColor) {
        toast.error("Please enter a product color");
        return;
      }

      const formData = new FormData();
      formData.append("productId", form.productId.toString());
      formData.append("productColor", form.productColor);
      formData.append("stockQuantity", form.stockQuantity?.toString() || "0");
      formData.append("lowStock", form.lowStock?.toString() || "0");

      // Only add image files (skip URL strings)
      [1, 2, 3, 4].forEach((i) => {
        const key = `thumbImage${i}`;
        const value = form[key];
        if (value instanceof File) {
          formData.append(key, value);
        }
      });

      console.log("Submitting FormData:");
      for (let [key, val] of formData.entries()) {
        console.log(key, val);
      }

      if (editingId) {
        await updateProductVariant(editingId, formData);
        toast.success("Variant updated successfully!");
      } else {
        await createProductVariant(formData);
        toast.success("Variant created successfully!");
      }

      resetForm();
      fetchVariants();
    } catch (err) {
      console.error("Error submitting form", err);
      toast.error("Failed to save variant");
    }
  };

  // --- Delete ---
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Delete Variant?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await deleteProductVariant(id);
          toast.success("Deleted");
          fetchVariants();
        } catch {
          toast.error("Failed to delete variant");
        }
      }
    });
  };

  // --- Edit ---
  const handleEdit = (variant: ProductVariantItem) => {
    setForm({
      categoryId: variant.Product?.categoryId || "",
      subCategoryId: variant.Product?.subCategoryId || "",
      productId: variant.productId,
      productColor: variant.productColor,
      stockQuantity: variant.stockQuantity,
      lowStock: variant.lowStock,
      thumbImage1: null, // clear file objects
      thumbImage2: null,
      thumbImage3: null,
      thumbImage4: null,
    });
  
    // Directly set preview URLs
    setPreviews({
      thumbImage1: variant.thumbImage1 || "",
      thumbImage2: variant.thumbImage2 || "",
      thumbImage3: variant.thumbImage3 || "",
      thumbImage4: variant.thumbImage4 || "",
    });
  
    setEditingId(variant.productVariantId);
    setShowModal(true);
  };
  

  return (
    <div className="p-5 border rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Variants</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Variant
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full text-sm text-left">
      <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-2">S.No</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">SubCategory</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Color</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Low Stock</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.length ? (
            variants.map((v, i) => (
              <tr key={v.productVariantId} className="border-b">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  {v.Product?.Category?.categoryName || "-"}
                </td>
                <td className="px-4 py-2">
                  {v.Product?.SubCategory?.subCategoryName || "-"}
                </td>
                <td className="px-4 py-2">{v.Product?.productName || "-"}</td>
                <td className="px-4 py-2">{v.productColor}</td>
                <td className="px-4 py-2">{v.stockQuantity}</td>
                <td className="px-4 py-2">{v.lowStock}</td>
                <td className="px-4 py-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(v)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.productVariantId)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  </div>
                </td>
                
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center p-4">
                No variants found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 ccc sss">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Variant" : "Add Variant"}
            </h2>

            {/* Selects */}
            <select
              value={form.categoryId || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  categoryId: e.target.value,
                  subCategoryId: "",
                  productId: "",
                })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            <select
              value={form.subCategoryId || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  subCategoryId: e.target.value,
                  productId: "",
                })
              }
              disabled={!form.categoryId}
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select SubCategory</option>
              {filteredSubCategories.map((sc) => (
                <option key={sc.subCategoryId} value={sc.subCategoryId}>
                  {sc.subCategoryName}
                </option>
              ))}
            </select>

            <select
              value={form.productId || ""}
              onChange={(e) =>
                setForm({ ...form, productId: Number(e.target.value) })
              }
              disabled={!form.subCategoryId}
              className="w-full border rounded px-3 py-2 mb-3"
            >
              <option value="">Select Product</option>
              {filteredProducts.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName}
                </option>
              ))}
            </select>

            {/* Inputs */}
            <input
              type="text"
              placeholder="Color"
              value={form.productColor || ""}
              onChange={(e) =>
                setForm({ ...form, productColor: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={form.stockQuantity || ""}
              onChange={(e) =>
                setForm({ ...form, stockQuantity: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mb-3"
            />
            <input
              type="number"
              placeholder="Low Stock"
              value={form.lowStock || ""}
              onChange={(e) => setForm({ ...form, lowStock: e.target.value })}
              className="w-full border rounded px-3 py-2 mb-3"
            />

            {/* Images */}
            <label className="block mb-1 text-sm mt-3">Variant Images</label>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, `thumbImage${i}`)}
                  className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
                />
                {previews[`thumbImage${i}`] && (
                  <img
                    src={previews[`thumbImage${i}`]}
                    alt={`Preview ${i}`}
                    className="mt-2 h-20 w-20 object-cover rounded border"
                  />
                )}
              </div>
            ))}

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-md"
              >
                {editingId ? "Update Variant" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
