import { useEffect, useState } from "react";
import toast from "react-hot-toast";
// import {
//   createProductVariant,
//   updateProductVariant,
// } from "../ProductVariant/productVariantApi";
import {
  // uploadChildImages,
  // getChildImages,
  deleteChildImage,
} from "../ProductVariant/productVariantChildApi";

interface VariantForm {
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  productColor: string;
  stockQuantity: string;
  lowStock: string;
  productVariantImage: File | null;
}

interface VariantBlockProps {
  productId: number;
  variantId?: number; // if provided => edit mode
  onSaved?: () => void; // callback to refresh parent
  onDelete?: () => void;
  onChange?: (data: any) => void;
}
const generateUniqueId = () =>
  `variant-${Math.random().toString(36).substr(2, 9)}`;
export default function VariantBlock({
  variantId,
  onDelete,
  onChange,
}: VariantBlockProps) {
  const [uniqueId] = useState(generateUniqueId());

  const [isDeleted, setIsDeleted] = useState(false);
  if (isDeleted) return null;
  const [form, setForm] = useState<VariantForm>({
    productColor: "",
    stockQuantity: "",
    lowStock: "",
    productVariantImage: null,
    isNewArrival: false,
    isBestSeller: false,
    isTrending: false,
  });

  const [childImages, setChildImages] = useState<File[]>([]);
  const [childPreviews, setChildPreviews] = useState<string[]>([]);
  const [existingChildImages, setExistingChildImages] = useState<
    { id: number; url: string }[]
  >([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [variantImageError, setVariantImageError] = useState("");
  const [errors, setErrors] = useState({
    productColor: "",
    stockQuantity: "",
    lowStock: "",
  });
  const [childImageErrors, setChildImageErrors] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

const handleVariantChange = (index: number, data: any) => {
  setVariants((prev) => {
    const updated = [...prev];
    updated[index] = { ...updated[index], ...data }; // Merge changes, don't overwrite
    return updated;
  });
};


  const handleRemoveImage = () => {
    setForm({ ...form, productVariantImage: null });
    setPreview(null);
  };

  const resetVariantForm = () => {
  setForm({
    productColor: "",
    stockQuantity: "",
    lowStock: "",
    productVariantImage: null,
    isNewArrival: false,
    isBestSeller: false,
    isTrending: false,
  });
  setPreview(null);
};


  // 🔹 Load existing images if edit mode
  useEffect(() => {
  if (onChange) {
    onChange({
      variantId,
      ...form, // ✅ Spreads all form fields correctly, including checkbox states
      childImages,
    });
  }
}, [form, childImages, variantId]);

  // --- Add new child images ---
  const handleChildImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (childImages.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
  
    files.forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
  
      img.onload = () => {
        if (img.width !== 726 || img.height !== 967) {
          toast.error(`"${file.name}" must be exactly 726 × 967 pixels.`);
          return; // ⛔ Prevent adding
        }
  
        // Only add valid images
        setChildImages((prev) => [...prev, file]);
        setChildPreviews((prev) => [...prev, img.src]);
        setChildImageErrors((prev) => [...prev, ""]);
      };
    });
  };
  
  

  // --- Remove child image before save ---
  const removeChildImage = (index: number) => {
    const newImgs = [...childImages];
    const newPrev = [...childPreviews];
    const newErrs = [...childImageErrors];
    newImgs.splice(index, 1);
    newPrev.splice(index, 1);
    newErrs.splice(index, 1);
    setChildImages(newImgs);
    setChildPreviews(newPrev);
    setChildImageErrors(newErrs);
  };

  // --- Delete existing child image (DB) ---
  const handleDeleteExisting = async (id: number) => {
    try {
      await deleteChildImage(id);
      setExistingChildImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Child image deleted");
    } catch (err) {
      toast.error("Failed to delete child image");
      console.error(err);
    }
  };

  // --- Submit variant ---
  // --- Submit variant ---


  // function onDelete(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
  //     throw new Error("Function not implemented.");
  // }

  return (
    <div className="border p-4 rounded-lg mb-4">
      <h4 className="font-semibold mb-3">
        {variantId ? "Edit Variant" : "Product Varient"}
      </h4>

      <input
        type="text"
        placeholder="Color"
        value={form.productColor}
        onChange={(e) => {
          const value = e.target.value;
          setForm({ ...form, productColor: value });
          setErrors((prev) => ({
            ...prev,
            productColor: value.trim() ? "" : "Color is required",
          }));
        }}
        className="w-full border rounded px-3 py-2 mb-2"
      />
      {errors.productColor && (
        <p className="text-red-500 text-xs">{errors.productColor}</p>
      )}

      <input
        type="number"
        placeholder="Stock Quantity"
        value={form.stockQuantity}
        onChange={(e) => {
          const value = e.target.value;
          setForm({ ...form, stockQuantity: value });
          setErrors((prev) => ({
            ...prev,
            stockQuantity: value.trim() ? "" : "Stock quantity is required",
          }));
        }}
        className="w-full border rounded px-3 py-2 mb-2"
      />
      {errors.stockQuantity && (
        <p className="text-red-500 text-xs">{errors.stockQuantity}</p>
      )}

      <input
        type="number"
        placeholder="Low Stock"
        value={form.lowStock}
        onChange={(e) => {
          const value = e.target.value;
          setForm({ ...form, lowStock: value });
          setErrors((prev) => ({
            ...prev,
            lowStock: value.trim() ? "" : "Low stock is required",
          }));
        }}
        className="w-full border rounded px-3 py-2 mb-2"
      />
      {errors.lowStock && (
        <p className="text-red-500 text-xs">{errors.lowStock}</p>
      )}
      <div>
      <label className="block mb-1 text-sm mt-3">Variant Image (726 × 967)</label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          if (!file) return;

          const img = new Image();
          img.src = URL.createObjectURL(file);

          img.onload = () => {
            if (img.width !== 726 || img.height !== 967) {
              setVariantImageError("Image must be exactly 726 × 967 pixels.");
              setForm({ ...form, productVariantImage: null });
              setPreview(null);
            } else {
              setVariantImageError("");
              setForm({ ...form, productVariantImage: file });
              setPreview(img.src);
            }
          };
        }}
        className="focus:border-ring-brand-300 h-11 w-auto overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
      />

      {variantImageError && (
        <p className="text-red-500 text-xs mt-1">{variantImageError}</p>
      )}

      <div className="mb-6">
              <label className="block mb-2 text-sm font-medium">Tags</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={form.isNewArrival || false}
                    onChange={(e) =>
  setForm((prev) => ({ ...prev, isNewArrival: e.target.checked }))
}

                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={form.isBestSeller || false}
                    onChange={(e) =>
  setForm((prev) => ({ ...prev, isBestSeller: e.target.checked }))
}

                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span>Best Seller</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={form.isTrending || false}
                    onChange={(e) =>
  setForm((prev) => ({ ...prev, isTrending: e.target.checked }))
}


                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span>Trending</span>
                </label>
              </div>
            </div>

      </div>
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

      <label className="block mb-1 text-sm mt-3">Thumb Images (726 × 967)</label>
      <button
        type="button"
        onClick={() =>
          document
            .getElementById(`child-input-${variantId || uniqueId}`)
            ?.click()
        }
        className="bg-blue-500 text-white px-3 py-1 rounded mb-2"
      >
        + Add Thumb Images
      </button>

      <input
        id={`child-input-${variantId || uniqueId}`}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChildImageChange}
        className="hidden"
      />

      {/* --- Existing child images (DB) --- */}
      <div className="flex gap-2 flex-wrap mb-2">
        {existingChildImages.map((img) => (
          <div key={img.id} className="relative inline-block">
            <img
              src={img.url}
              className="w-16 h-16 rounded object-cover border"
            />
            <button
              onClick={() => handleDeleteExisting(img.id)}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* <button
  type="button"
  onClick={handleSubmit}
  className="bg-green-500 text-white px-4 py-2 rounded mt-3 mr-2"
>
  {variantId ? "Update Variant" : "Save Variant"}
</button> */}

      <button
        type="button"
        onClick={() => {
          if (onDelete) {
            onDelete(); // parent handles removal
          } else {
            setIsDeleted(true); // local removal
          }
        }}
        className="bg-red-500 text-white px-4 py-2 rounded mt-3"
      >
        Delete Variant
      </button>

      {/* --- New previews (local) --- */}
      <div className="flex gap-2 flex-wrap">
        {childPreviews.map((src, i) => (
          <div key={i} className="relative inline-block">
            <img src={src} className="w-16 h-16 rounded object-cover border" />
            <button
              onClick={() => removeChildImage(i)}
              className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full"
            >
              ✕
            </button>
            {childImageErrors[i] && (
              <p className="text-red-500 text-xs mt-1">{childImageErrors[i]}</p>
            )}
          </div>
        ))}
      </div>

      {/* <button
        type="button"
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded mt-3"
      >
        {variantId ? "Update Variant" : "Save Variant"}
      </button> */}
    </div>
  );
}
