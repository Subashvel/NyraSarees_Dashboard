import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createProductVariant,
  updateProductVariant,
} from "../ProductVariant/productVariantApi";
import {
  uploadChildImages,
  getChildImages,
  deleteChildImage,
} from "../ProductVariant/productVariantChildApi";


interface VariantForm {
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
}

export default function VariantBlock({
  productId,
  variantId,
  onSaved,
  onDelete,
}: VariantBlockProps) {
    const [isDeleted, setIsDeleted] = useState(false);
    if (isDeleted) return null;
  const [form, setForm] = useState<VariantForm>({
    productColor: "",
    stockQuantity: "",
    lowStock: "",
    productVariantImage: null,
  });

  const [childImages, setChildImages] = useState<File[]>([]);
  const [childPreviews, setChildPreviews] = useState<string[]>([]);
  const [existingChildImages, setExistingChildImages] = useState<
    { id: number; url: string }[]
  >([]);

  // 🔹 Load existing images if edit mode
  useEffect(() => {
    if (variantId) {
      (async () => {
        try {
          const res = await getChildImages(variantId);
          setExistingChildImages(res); // expects [{id, url}]
        } catch (err) {
          console.error("Error fetching child images", err);
        }
      })();
    }
  }, [variantId]);

  // --- Add new child images ---
  const handleChildImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (childImages.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setChildImages((prev) => [...prev, ...files]);
    setChildPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  // --- Remove child image before save ---
  const removeChildImage = (index: number) => {
    const newImgs = [...childImages];
    const newPrev = [...childPreviews];
    newImgs.splice(index, 1);
    newPrev.splice(index, 1);
    setChildImages(newImgs);
    setChildPreviews(newPrev);
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
  const handleSubmit = async () => {
    if (!productId) {
      toast.error("Save product first before adding variants!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("productId", productId.toString());
      formData.append("productColor", form.productColor);
      formData.append("stockQuantity", form.stockQuantity || "0");
      formData.append("lowStock", form.lowStock || "0");

      if (form.productVariantImage) {
        formData.append("productVariantImage", form.productVariantImage);
      }

      let savedVariant: any;
      if (variantId) {
        savedVariant = await updateProductVariant(variantId, formData);
        toast.success("Variant updated!");
      } else {
        savedVariant = await createProductVariant(formData);
        toast.success("Variant created!");
      }

      // 🔹 Upload child images if any
      const idToUse =
        variantId || savedVariant?.data?.productVariantId || null;
      if (idToUse && childImages.length > 0) {
        await uploadChildImages(idToUse, childImages);
        toast.success("Child images uploaded!");
        setChildImages([]);
        setChildPreviews([]);
      }

      if (onSaved) onSaved();
    } catch (err) {
      toast.error("Failed to save variant");
      console.error(err);
    }
  };

    // function onDelete(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    //     throw new Error("Function not implemented.");
    // }

  return (
    <div className="border p-4 rounded-lg mb-4">
      <h4 className="font-semibold mb-3">
        {variantId ? "Edit Variant" : "New Variant"}
      </h4>

      <input
        type="text"
        placeholder="Color"
        value={form.productColor}
        onChange={(e) => setForm({ ...form, productColor: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
      />

      <input
        type="number"
        placeholder="Stock Quantity"
        value={form.stockQuantity}
        onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
      />

      <input
        type="number"
        placeholder="Low Stock"
        value={form.lowStock}
        onChange={(e) => setForm({ ...form, lowStock: e.target.value })}
        className="w-full border rounded px-3 py-2 mb-2"
      />

      <label className="block mb-1">Variant Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setForm({ ...form, productVariantImage: e.target.files?.[0] || null })
        }
        className="mb-3"
      />

      <label className="block mb-1">Thumb Images</label>
      <button
        type="button"
        onClick={() =>
          document.getElementById(`child-input-${variantId || "new"}`)?.click()
        }
        className="bg-blue-500 text-white px-3 py-1 rounded mb-2"
      >
        + Add Thumb Images
      </button>
      <input
        id={`child-input-${variantId || "new"}`}
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
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded mt-3"
      >
        {variantId ? "Update Variant" : "Save Variant"}
      </button>
    </div>
  );
}
