import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./productApi";
import { getSubCategories } from "../subCategories/subCategoryApi";
import { getCategories } from "../categories/categoryApi";
import VariantBlock from "../Products/VariantBlock";

interface ProductItem {
  productId: number;
  productName: string;
  productDescription: string;
  productImage: string;
  brandName: string;
  material: string;
  productMrpPrice: number;
  productOfferPrice: number;
  categoryId: number;
  subCategoryId: number;
}

interface SubCategoryItem {
  subCategoryId: number;
  subCategoryName: string;
}

interface CategoryItem {
  categoryId: number;
  categoryName: string;
}

const imageBaseUrl = `http://localhost:5000/uploads/`;

export default function ProductComponents() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null
  );
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [variantBlocks, setVariantBlocks] = useState<number[]>([]);

  const [form, setForm] = useState({
    productName: "",
    productDescription: "",
    brandName: "",
    material: "",
    productMrpPrice: "",
    productOfferPrice: "",
    productImage: "",
    subCategoryId: "",
    categoryId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchSubCategories();
      await fetchProducts();
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const json = await getCategories();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
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
      setLoading(true);
      const json = await getProducts();
      if (json.success && Array.isArray(json.data)) {
        const updated = json.data.map((p: ProductItem) => ({
          ...p,
          categoryId: Number(p.categoryId),
          subCategoryId: Number(p.subCategoryId),
          productImage: p.productImage?.startsWith("http")
            ? p.productImage
            : `${imageBaseUrl}${p.productImage}`,
        }));
        setProducts(updated);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      productName: "",
      productDescription: "",
      productImage: "",
      brandName: "",
      material: "",
      productMrpPrice: "",
      productOfferPrice: "",
      subCategoryId: "",
      categoryId: "",
    });
    setProductImage(null);
    setImagePreview(null);
    setEditingProduct(null);
    setVariantBlocks([]);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = async (product: ProductItem) => {
    setEditingProduct(product);
    setForm({
      ...product,
      productMrpPrice: String(product.productMrpPrice),
      productOfferPrice: String(product.productOfferPrice),
      subCategoryId: String(product.subCategoryId),
      categoryId: String(product.categoryId),
    });
    setProductImage(null);
    setImagePreview(product.productImage || null);
    setShowModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProductImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.productName.trim() || !form.subCategoryId || !form.categoryId) {
      toast.error("All Fields are required");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    if (productImage) {
      formData.append("productImage", productImage);
    }

    try {
      let productResponse;
      if (editingProduct) {
        productResponse = await updateProduct(
          editingProduct.productId,
          formData
        );
        toast.success("Product updated successfully!");
      } else {
        productResponse = await createProduct(formData);
        toast.success("Product created successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error("Failed to save product");
      console.error(err);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProduct(id);
          toast.success("Product deleted successfully!");
          fetchProducts();
        } catch {
          toast.error("Failed to delete");
        }
      }
    });
  };

  function setVariants(arg0: (prev: any) => any) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl lg:p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2">S.NO</th>
              <th className="px-4 py-2">Category Name</th>
              <th className="px-4 py-2">Subcategory Name</th>
              <th className="px-4 py-2">Product Name</th>
              <th className="px-4 py-2">Product Brand</th>
              <th className="px-4 py-2">Product Image</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p, index) => (
                <tr key={p.productId} className="border-b">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    {categories.find((cat) => cat.categoryId === p.categoryId)
                      ?.categoryName || "Unknown"}
                  </td>
                  <td className="px-4 py-2">
                    {subCategories.find(
                      (s) => s.subCategoryId === p.subCategoryId
                    )?.subCategoryName || "Unknown"}
                  </td>
                  <td className="px-4 py-2">{p.productName}</td>
                  <td className="px-4 py-2">{p.brandName}</td>
                  <td className="px-4 py-2">
                    <img
                      src={p.productImage}
                      alt={p.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.productId)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 ccc sss">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            {/* Category */}
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            {/* Subcategory */}
            <select
              name="subCategoryId"
              value={form.subCategoryId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            >
              <option value="">-- Select Subcategory --</option>
              {subCategories.map((s) => (
                <option key={s.subCategoryId} value={s.subCategoryId}>
                  {s.subCategoryName}
                </option>
              ))}
            </select>

            {/* Other fields */}
            <input
              type="text"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              placeholder="Product Name"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <input
              type="text"
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              placeholder="Brand"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <input
              type="text"
              name="material"
              value={form.material}
              onChange={handleChange}
              placeholder="Material"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <input
              type="number"
              name="productMrpPrice"
              value={form.productMrpPrice}
              onChange={handleChange}
              placeholder="MRP Price"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />
            <input
              type="number"
              name="productOfferPrice"
              value={form.productOfferPrice}
              onChange={handleChange}
              placeholder="Offer Price"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />

            {/* Image */}
            <label className="block mb-1 text-sm mt-3">Product Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-10 mt-2 rounded"
              />
            )}

            {/* Variants */}
            <h3 className="text-lg font-semibold mb-4 mt-10">
              Product Variants
            </h3>

            
            {variantBlocks.map((blockId) => (
  <VariantBlock
    key={blockId}
    productId={editingProduct ? editingProduct.productId : 0} // ✅ use current productId
    onDelete={() => {
      setVariantBlocks((prev) => prev.filter((id) => id !== blockId));
    }}
  />
))}


            <button
              type="button"
              onClick={() => setVariantBlocks((prev) => [...prev, Date.now()])}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
              + Add Another Variant
            </button>

            {/* Submit Product */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                {editingProduct ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
