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
import {
  getChildImages,
  deleteChildImage,
  uploadChildImages,
} from "../ProductVariant/productVariantChildApi";
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
  variantId: number;
  productColor: string;
  stockQuantity: string;
  lowStock: string;
  productVariantImage: string | null;
  Product?: {
    productName: string;
    categoryId?: number;
    subCategoryId?: number;
    SubCategory?: {
      subCategoryName: string;
      Category?: {
        categoryName: string;
      };
    };
  };
}

const imageBaseUrl = `http://localhost:5000/uploads/`;

export default function ProductVariants() {
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [form, setForm] = useState<any>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [, setLoading] = useState(false);
  const [childImages, setChildImages] = useState<File[]>([]);
  const [childPreview, setChildPreview] = useState<string[]>([]);
  const [existingChildImages, setExistingChildImages] = useState<
    { id: number; url: string }[]
  >([]);
  const [childImageErrors, setChildImageErrors] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    categoryId: "",
    subCategoryId: "",
    productId: "",
    productColor: "",
    stockQuantity: "",
    lowStock: "",
    productVariantImage: "",
  });

  // --- Fetch Data ---
  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchSubCategories();
      await fetchProducts();
      await fetchVariants();
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
        }));
        setProducts(updated);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async () => {
    try {
      const json = await getProductVariants();
      if (json.success && Array.isArray(json.data)) {
        const updated = json.data.map((variant: ProductVariantItem) => {
          const product = products.find(
            (p) => p.productId === variant.productId
          );

          return {
            ...variant,
            productVariantImage: variant.productVariantImage
              ? `${imageBaseUrl}${variant.productVariantImage}`
              : null,
            categoryName:
              product &&
              categories.find((c) => c.categoryId === product.categoryId)
                ?.categoryName,
            subCategoryName:
              product &&
              subCategories.find(
                (s) => s.subCategoryId === product.subCategoryId
              )?.subCategoryName,
            productName: product?.productName || "-",
          };
        });
        setVariants(updated);
      } else {
        setVariants([]);
      }
    } catch (error) {
      console.error("Error fetching product variants:", error);
      toast.error("Failed to fetch product variants");
    }
  };

  // --- Reset ---
  const resetForm = () => {
    setForm({});
    setPreview(null);
    setEditingId(null);
    setShowModal(false);
    setChildImages([]);
    setChildPreview([]);
    setExistingChildImages([]);
    setEditingId(null);
  };

  // --- Image Change ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width !== 726 || img.height !== 967) {
        setErrors((prev) => ({
          ...prev,
          productVariantImage: "Image must be exactly 726 × 967 pixels.",
        }));
        setForm({ ...form, productVariantImage: null });
        setPreview(null);
      } else {
        setErrors((prev) => ({ ...prev, productVariantImage: "" }));
        setForm({ ...form, productVariantImage: file });
        setPreview(img.src);
      }
    };
  };

  // --- Remove Image ---
  const handleRemoveImage = () => {
    setForm({ ...form, productVariantImage: null });
    setPreview(null);
  };

  const handleChildImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (childImages.length >= 10) {
      setChildImageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = "Maximum 10 images allowed";
        return newErrors;
      });
      return;
    }
  
    const img = new Image();
    img.src = URL.createObjectURL(file);
  
    img.onload = () => {
      if (img.width !== 726 || img.height !== 967) {
        setChildImageErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = "Image must be exactly 726 × 967 pixels.";
          return newErrors;
        });
        return;
      }
  
      // ✅ Clear error if valid
      setChildImageErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = "";
        return newErrors;
      });
  
      const newImages = [...childImages];
      newImages[index] = file;
      setChildImages(newImages);
  
      const newPreviews = [...childPreview];
      newPreviews[index] = img.src;
      setChildPreview(newPreviews);
    };
  };
  
  

  const addAnotherImageField = () => {
    if (childImages.length >= 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setChildImages([...childImages, new File([], "")]); // placeholder
    setChildPreview([...childPreview, ""]);
    setChildImageErrors([...childImageErrors, ""]); // ✅ add error placeholder
  };
  

  const removeChildImage = (index: number) => {
    const newImages = [...childImages];
    const newPreviews = [...childPreview];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setChildImages(newImages);
    setChildPreview(newPreviews);
  };

  // --- Submit ---
  const handleSubmit = async () => {
    try {
      if (
        !form.categoryId ||
        !form.subCategoryId ||
        !form.productId ||
        !form.productColor
      ) {
        setErrors({
          categoryId: form.categoryId ? "" : "Category name is required",
          subCategoryId: form.subCategoryId
            ? ""
            : "Subcategory name is required",
          productId: form.productId ? "" : "Product name is required",
          productColor: form.productColor ? "" : "Color is required",
          stockQuantity: form.stockQuantity ? "" : "Stock quantity is required",
          lowStock: form.lowStock ? "" : "Low stock is required",
          productVariantImage: form.productVariantImage
            ? ""
            : errors.productVariantImage,
        });
        return;
      }

      const formData = new FormData();
      formData.append("productId", form.productId.toString());
      formData.append("productColor", form.productColor);
      formData.append("stockQuantity", form.stockQuantity?.toString() || "0");
      formData.append("lowStock", form.lowStock?.toString() || "0");

      if (form.productVariantImage instanceof File) {
        formData.append("productVariantImage", form.productVariantImage);
      }

      let savedVariant;
      if (editingId) {
        savedVariant = await updateProductVariant(editingId, formData);
        toast.success("Variant updated successfully!");
      } else {
        savedVariant = await createProductVariant(formData);
        toast.success("Variant created successfully!");
      }

      // Upload child images if present
      if (childImages.length > 0 && savedVariant?.data?.productVariantId) {
        await uploadChildImages(
          savedVariant.data.productVariantId,
          childImages
        );
        toast.success("Child images uploaded!");
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

  const handleEdit = async (variant: ProductVariantItem) => {
    setForm({
      categoryId: variant.Product?.categoryId || "",
      subCategoryId: variant.Product?.subCategoryId || "",
      productId: variant.productId,
      productColor: variant.productColor,
      stockQuantity: variant.stockQuantity,
      lowStock: variant.lowStock,
      productVariantImage: null,
    });

    setPreview(variant.productVariantImage || null);
    setEditingId(variant.productVariantId);
    setShowModal(true);

    try {
      const res = await getChildImages(variant.productVariantId);
      if (res.success && Array.isArray(res.data)) {
        setExistingChildImages(
          res.data.map((img: any) => ({
            id: img.childImageId,
            url: `http://localhost:5000/uploads/${img.childImage}`,
          }))
        );
      } else {
        setExistingChildImages([]);
      }
    } catch (err) {
      console.error("Failed to fetch child images", err);
    }
  };

  const handleDeleteChildImage = async (id: number) => {
    try {
      await deleteChildImage(id); // ID now matches backend PK
      setExistingChildImages(
        existingChildImages.filter((img) => img.id !== id)
      );
      toast.success("Child image deleted");
    } catch (error) {
      console.error("Error deleting child image", error);
      toast.error("Failed to delete child image");
    }
  };

  const filteredVariants = variants.filter((v) => {
    const matchesCategory = form.categoryId
      ? v.Product?.categoryId === Number(form.categoryId)
      : true;

    const matchesSubCategory = form.subCategoryId
      ? v.Product?.subCategoryId === Number(form.subCategoryId)
      : true;

    return matchesCategory && matchesSubCategory;
  });

  // --- Filters ---
  const filteredSubCategories = subCategories.filter(
    (sc) => sc.categoryId === Number(form.categoryId || 0)
  );
  const filteredProducts = products.filter(
    (p) => p.subCategoryId === Number(form.subCategoryId || 0)
  );

  return (
    <div className="p-5 border rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Variants</h2>

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
          // className="w-full border rounded px-3 py-2 mb-3"
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
          // className="w-full border rounded px-3 py-2 mb-3"
        >
          <option value="">Select SubCategory</option>
          {filteredSubCategories.map((sc) => (
            <option key={sc.subCategoryId} value={sc.subCategoryId}>
              {sc.subCategoryName}
            </option>
          ))}
        </select>
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
            <th className="px-4 py-2">Category Name</th>
            <th className="px-4 py-2">SubCategory Name</th>
            <th className="px-4 py-2">Product Name</th>
            <th className="px-4 py-2">Product Color</th>
            <th className="px-4 py-2">Product Stock</th>
            <th className="px-4 py-2">Low Stock</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVariants.length ? (
            filteredVariants.map((v, i) => (
              <tr key={v.productVariantId} className="border-b">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  {v.Product?.SubCategory?.Category?.categoryName || "N/A"}
                </td>
                <td className="px-4 py-2">
                  {v.Product?.SubCategory?.subCategoryName || "N/A"}
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
              <td colSpan={8} className="text-center py-4">
                No variants found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 ccc sss">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl p-8 relative mt-10">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Variant" : "Add Variant"}
            </h2>

            {/* Dropdowns */}
            <select
              value={form.categoryId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm({
                  ...form,
                  categoryId: value,
                  subCategoryId: "",
                  productId: "",
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

            <select
              value={form.subCategoryId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, subCategoryId: value, productId: "" });
                setErrors((prev) => ({
                  ...prev,
                  subCategoryId: value ? "" : "Subcategory name is required",
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

            <select
              value={form.productId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, productId: Number(value) });
                setErrors((prev) => ({
                  ...prev,
                  productId: value ? "" : "Product is required",
                }));
              }}
              disabled={!form.subCategoryId}
              className={`w-full border rounded px-3 py-2 mb-1 
    ${errors.productId ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select Product</option>
              {filteredProducts.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productName}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-red-500 text-xs">{errors.productId}</p>
            )}

            {/* Existing Child Images */}
            {editingId && existingChildImages.length > 0 && (
              <div className="mt-4">
                <label className="block mb-2 text-sm font-semibold">
                  Existing Child Images
                </label>
                <div className="flex flex-wrap gap-3">
                  {existingChildImages.map((img) => (
                    <div key={img.id} className="relative inline-block">
                      <img
                        src={img.url}
                        className="h-16 w-16 object-cover rounded border"
                      />
                      <button
                        onClick={() => handleDeleteChildImage(img.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs */}
            <input
              type="text"
              placeholder="Color"
              value={form.productColor || ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, productColor: value });
                setErrors((prev) => ({
                  ...prev,
                  productColor: value.trim() ? "" : "Color is required",
                }));
              }}
              className={`w-full border rounded px-3 py-2 mb-1 ${
                errors.productColor ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.productColor && (
              <p className="text-red-500 text-xs">{errors.productColor}</p>
            )}
            <input
              type="number"
              placeholder="Stock Quantity"
              value={form.stockQuantity || ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, stockQuantity: value });
                setErrors((prev) => ({
                  ...prev,
                  stockQuantity: value ? "" : "Stock quantity is required",
                }));
              }}
              className={`w-full border rounded px-3 py-2 mb-1 ${
                errors.stockQuantity ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.stockQuantity && (
              <p className="text-red-500 text-xs">{errors.stockQuantity}</p>
            )}
            <input
              type="number"
              placeholder="Low Stock"
              value={form.lowStock || ""}
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, lowStock: value });
                setErrors((prev) => ({
                  ...prev,
                  lowStock: value ? "" : "Low stock is required",
                }));
              }}
              className={`w-full border rounded px-3 py-2 mb-1 ${
                errors.lowStock ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lowStock && (
              <p className="text-red-500 text-xs">{errors.lowStock}</p>
            )}

            {/* Image Upload */}
            <label className="block mb-1 text-sm mt-3">Variant Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded px-3 py-2"
            />
            {preview && (
              <div className="mt-2 relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded border"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full"
                >
                  ✕
                </button>
              </div>
            )}
            {errors.productVariantImage && (
              <p className="text-red-500 text-xs">
                {errors.productVariantImage}
              </p>
            )}

            {/* Child Images */}
            <label className="block mt-4 text-sm font-semibold">
              Thumb Images
            </label>
            {childImages.map((_, index) => (
  <div key={index} className="flex flex-col gap-1 mb-2">
    <div className="flex items-center gap-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleChildImageChange(e, index)}
        className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
      />

      {childPreview[index] && (
        <div className="relative inline-block">
          <img
            src={childPreview[index]}
            className="h-16 w-16 object-cover rounded border"
          />
          <button
            onClick={() => removeChildImage(index)}
            className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </div>

    {/* 🔹 Show error here */}
    {childImageErrors[index] && (
      <p className="text-red-500 text-xs">{childImageErrors[index]}</p>
    )}
  </div>
))}

            <button
              type="button"
              onClick={addAnotherImageField}
              className="mt-2 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              + Add Thumb Images
            </button>

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
