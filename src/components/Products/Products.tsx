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
import { createProductVariant } from "../ProductVariant/productVariantApi";
import { uploadChildImages } from "../ProductVariant/productVariantChildApi";

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
  categoryId: number;
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
  const [variantBlocks, setVariantBlocks] = useState<number[]>([Date.now()]);

  const [variants, setVariants] = useState<any[]>([]);

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

  const [errors, setErrors] = useState({
    categoryId: "",
    subCategoryId: "",
    productName: "",
    productDescription: "",
    brandName: "",
    material: "",
    productMrpPrice: "",
    productOfferPrice: "",
    productImage: "",
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
    setVariantBlocks([Date.now()]);
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
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;
  setForm({ ...form, [name]: value });
  validateField(name, value);

  // Re-validate Offer Price if MRP changes
  if (name === "productMrpPrice" && form.productOfferPrice) {
    validateField("productOfferPrice", form.productOfferPrice);
  }
};


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width !== 726 || img.height !== 967) {
        setErrors((prev) => ({
          ...prev,
          productImage: "Image must be exactly 726 × 967 pixels.",
        }));
        setImagePreview(null);
      } else {
        setErrors((prev) => ({ ...prev, productImage: "" }));
        setImagePreview(img.src);
        setProductImage(file); // Save valid image
      }
    };
  };

  const handleSubmit = async () => {
    Object.entries(form).forEach(([name, value]) => validateField(name, value));

    if (Object.values(errors).some((err) => err)) return;
    if (!form.productName.trim() || !form.subCategoryId || !form.categoryId) {
      toast.error("All Fields are required");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    if (productImage) formData.append("productImage", productImage);

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

      const productId =
        editingProduct?.productId || productResponse?.data?.productId;

      // 🔹 Validate all variants before saving
      for (const variant of variants) {
        if (variant.variantImageError) {
          toast.error("One or more variants have invalid main images.");
          return;
        }
        if (variant.childImageErrors?.some((err: string) => err)) {
          toast.error("One or more child images are invalid.");
          return;
        }
      }

      // 🔹 Save Variants
      for (const variant of variants) {
  const variantData = new FormData();
  variantData.append("productId", productId);
  variantData.append("productColor", variant.productColor);
  variantData.append("stockQuantity", variant.stockQuantity || "0");
  variantData.append("lowStock", variant.lowStock || "0");

  if (variant.productVariantImage) {
    variantData.append("productVariantImage", variant.productVariantImage);
  }

  // FIX: Append checkbox values
  variantData.append("isNewArrival", String(variant.isNewArrival));
  variantData.append("isBestSeller", String(variant.isBestSeller));
  variantData.append("isTrending", String(variant.isTrending));

  const savedVariant = await createProductVariant(variantData);

        // 🔹 Upload only valid child images
        if (variant.childImages?.length) {
          const validChildImages = variant.childImages.filter(
            (_: File, i: number) => !variant.childImageErrors?.[i]
          );
          if (validChildImages.length > 0) {
            await uploadChildImages(
              savedVariant?.data?.productVariantId,
              validChildImages
            );
          }
        }
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

  const handleRemoveImage = () => {
    setForm({ ...form, productImage: "" });
    setImagePreview(null);
  };

  const validateField = (name: string, value: string) => {
  let error = "";

  switch (name) {
    case "categoryId":
      if (!value) error = "Category is required";
      break;
    case "subCategoryId":
      if (!value) error = "Subcategory is required";
      break;
    case "productName":
      if (!value.trim()) error = "Product name is required";
      else if (value.trim().length < 3)
        error = "Product Name should be at least 3 characters long";
      break;
    case "productDescription":
      if (!value.trim()) error = "Product Description is required";
      else if (value.trim().length < 3)
        error = "Product Description should be at least 3 characters long";
      else if (value.length > 500)
        error = "Product Description cannot exceed 500 characters";
      break;
    case "brandName":
      if (!value.trim()) error = "Product Brand name is required";
      else if (value.trim().length < 3)
        error = "Product Brand Name should be at least 3 characters long";
      else if (value.length > 50)
        error = "Product Brand name cannot exceed 50 characters";
      break;
    case "material":
      if (!value.trim()) error = "Product Material is required";
      else if (value.trim().length < 3)
        error = "Product Material Name should be at least 3 characters long";
      else if (value.length > 50)
        error = "Product Material cannot exceed 50 characters";
      break;
    case "productMrpPrice":
      if (!value.trim()) {
        error = "Product MRP Price is required";
      } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        error = "Product MRP Price must be a valid number";
      }
      break;

    case "productOfferPrice":
      if (!value.trim()) {
        error = "Product Offer Price is required";
      } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        error = "Product Offer Price must be a valid number";
      } else {
        const mrp = parseFloat(form.productMrpPrice || "0");
        const offer = parseFloat(value);
        if (offer > mrp) {
          error = "Product Offer Price should not be more than Product MRP Price";
        }
      }
      break;
    default:
      break;
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
};


  const filteredProducts = form.categoryId
    ? products.filter((p) => String(p.categoryId) === String(form.categoryId))
    : products;

    const filteredSubCategories = subCategories.filter(
    (sc) => sc.categoryId === Number(form.categoryId || 0)
  );

  return (
    <div className="p-5 border border-gray-200 rounded-2xl lg:p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <select
          value={form.categoryId || ""}
          onChange={(e) =>
            setForm({
              ...form,
              categoryId: e.target.value,
              subCategoryId: "",
            })
          }
          // className="w-full border rounded px-3 py-2 mb-3"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.categoryId} value={c.categoryId}>
              {c.categoryName}
            </option>
          ))}
        </select>
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
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, index) => (
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-8 relative mt-10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-bottom">
              {/* Category */}
              <div>
                {/* Dropdowns */}
                <label className="block mb-1 text-sm">Category Name</label>
                <select
                  value={form.categoryId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      categoryId: value,
                      subCategoryId: "",
                      // productId: "",
                    });
                    setErrors((prev) => ({
                      ...prev,
                      categoryId: value ? "" : "Category name is required",
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 mb-1 ${
                    errors.categoryId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>

                {errors.categoryId && (
                  <p className="text-red-500 text-xs">{errors.categoryId}</p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block mb-1 text-sm">Sub Category Name</label>
                <select
                  value={form.subCategoryId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({ ...form, subCategoryId: value,  });
                    setErrors((prev) => ({
                      ...prev,
                      subCategoryId: value
                        ? ""
                        : "Subcategory name is required",
                    }));
                  }}
                  className={`w-full border rounded px-3 py-2 mb-1 ${
                    errors.subCategoryId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select SubCategory</option>
                  {filteredSubCategories.map((sc) => (
                    <option key={sc.subCategoryId} value={sc.subCategoryId}>
                      {sc.subCategoryName}
                    </option>
                  ))}
                </select>

                {errors.subCategoryId && (
                  <p className="text-red-500 text-xs">{errors.subCategoryId}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-bottom">
              <div>
                <label className="block mb-1 text-sm">Product Name</label>
                {/* Other fields */}
                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className={`w-full border rounded px-3 py-2 mb-1 ${
                    errors.productName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.productName && (
                  <p className="text-red-500 text-xs">{errors.productName}</p>
                )}
              </div>

              <div>
                <label className="block mb-1 text-sm">
                  Product Description
                </label>
                <textarea
                  name="productDescription"
                  value={form.productDescription}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                />
                {errors.productDescription && (
                  <p className="text-red-500 text-xs">
                    {errors.productDescription}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-bottom">
              <div>
                <label className="block mb-1 text-sm">Product Brand Name</label>
                <input
                  type="text"
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  placeholder="Brand"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                />
                {errors.brandName && (
                  <p className="text-red-500 text-xs">{errors.brandName}</p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm">Product Material</label>
                <input
                  type="text"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  placeholder="Material"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                />
                {errors.material && (
                  <p className="text-red-500 text-xs">{errors.material}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-sm">Product MRP Price</label>
                <input
                  type="text"
                  name="productMrpPrice"
                  value={form.productMrpPrice}
                  onChange={handleChange}
                  placeholder="MRP Price"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                />
                {errors.productMrpPrice && (
                  <p className="text-red-500 text-xs">
                    {errors.productMrpPrice}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-1 text-sm">
                  Product Offer Price
                </label>
                <input
                  type="text"
                  name="productOfferPrice"
                  value={form.productOfferPrice}
                  onChange={handleChange}
                  placeholder="Offer Price"
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                />
                {errors.productOfferPrice && (
                  <p className="text-red-500 text-xs">
                    {errors.productOfferPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Image */}
            <label className="block mb-1 text-sm mt-3 ">Product Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="focus:border-ring-brand-300 h-11 w-auto overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300"
            />
            {errors.productImage && (
              <p className="text-red-500 text-xs mt-1">{errors.productImage}</p>
            )}
            <div className="mb-10">
              <label className="block mb-1 text-sm font-medium">
                Product Image (726 × 967)
              </label>
              <div
                className="preview-container"
                onClick={() =>
                  document.getElementById("productImageInput")?.click()
                }
              >
                {imagePreview ? (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v9m-7-4l7-7 7 7"
                      />
                    </svg>
                    Upload Image
                  </div>
                )}
              </div>

              <input
                id="productImageInput"
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Variants */}
            {/* <h3 className="text-lg font-semibold mb-4 mt-10">
              Product Variants
            </h3> */}

            {variantBlocks.map((blockId) => (
              <VariantBlock
                key={blockId}
                productId={editingProduct ? editingProduct.productId : 0}
                onChange={(data) => {
                  setVariants((prev) => {
                    const updated = [...prev];
                    const idx = updated.findIndex((v) => v.blockId === blockId);

                    if (idx >= 0) {
                      updated[idx] = { ...data, blockId };
                    } else {
                      updated.push({ ...data, blockId });
                    }
                    return updated;
                  });
                }}
                onDelete={() => {
                  setVariantBlocks((prev) =>
                    prev.filter((id) => id !== blockId)
                  );
                  setVariants((prev) =>
                    prev.filter((v) => v.blockId !== blockId)
                  );
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
