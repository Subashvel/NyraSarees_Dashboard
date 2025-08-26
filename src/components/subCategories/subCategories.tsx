import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "./subCategoryApi";
import { getCategories } from "../categories/categoryApi";

interface SubCategoryItem {
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number; // ✅ added so we can show category name
  updatedAt: string;
}

interface CategoryItem {
  categoryId: number;
  categoryName: string;
}

export default function SubCategoryComponents() {
  const [SubCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<SubCategoryItem | null>(null);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subCategoryError, setSubCategoryError] = useState("");
  const [categorySelectError, setCategorySelectError] = useState("");

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
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
      setLoading(true);
      const json = await getSubCategories();
      if (json.success && Array.isArray(json.data)) {
        setSubCategories(json.data);
      } else {
        setSubCategories([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubCategoryName("");
    setSelectedCategoryId(null);
    setEditingSubcategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (subcat: SubCategoryItem) => {
    setEditingSubcategory(subcat);
    setSubCategoryName(subcat.subCategoryName);
    setSelectedCategoryId(subcat.categoryId); // ✅ pre-fill category
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const nameError = validateSubCategoryName(subCategoryName);
    setSubCategoryError(nameError);

    if (!selectedCategoryId) {
      setCategorySelectError("Please select a category");
    } else {
      setCategorySelectError("");
    }

    if (nameError || !selectedCategoryId) return;

    try {
      if (editingSubcategory) {
        await updateSubCategory(
          editingSubcategory.subCategoryId,
          selectedCategoryId,
          subCategoryName.trim()
        );
        toast.success("Subcategory updated successfully!");
      } else {
        await createSubCategory(selectedCategoryId, subCategoryName.trim());
        toast.success("Subcategory added successfully!");
      }

      setShowModal(false);
      resetForm();
      fetchSubCategories();
    } catch (err) {
      toast.error("Failed to save subcategory");
      console.error(err);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the subcategory.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSubCategory(id);
          toast.success("Subcategory deleted successfully!");
          fetchSubCategories();
        } catch {
          toast.error("Failed to delete");
        }
      }
    });
  };

  const validateSubCategoryName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "Subcategory name is required";
    if (trimmed.length < 3)
      return "Subcategory Name should be at least 3 characters";
    if (trimmed.length > 50)
      return "Subcategory Name must not exceed 50 characters";
    return "";
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Subcategories</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Subcategory
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
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : SubCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No subcategories found.
                </td>
              </tr>
            ) : (
              SubCategories.map((subcat, index) => (
                <tr key={subcat.subCategoryId} className="border-b">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    {categories.find((c) => c.categoryId === subcat.categoryId)
                      ?.categoryName || "Unknown"}
                  </td>
                  <td className="px-4 py-2">{subcat.subCategoryName}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(subcat)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subcat.subCategoryId)}
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
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 sss">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
            </h2>

            <label className="block mb-1 text-sm">Category Name</label>
            <select
              value={selectedCategoryId !== null ? selectedCategoryId : ""}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? null : Number(e.target.value);
                setSelectedCategoryId(value);
                setCategorySelectError(
                  value === null ? "Please select a category" : ""
                );
              }}
              className={`w-full border rounded px-3 py-2 mb-1 ${
                categorySelectError ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            {categorySelectError && (
              <p className="text-red-500 text-sm mb-2">{categorySelectError}</p>
            )}

            <label className="block mb-1 text-sm">Subcategory Name</label>
            <input
              type="text"
              value={subCategoryName}
              maxLength={50}
              onChange={(e) => {
                const value = e.target.value;
                setSubCategoryName(value);
                setSubCategoryError(validateSubCategoryName(value)); // live validation
              }}
              className={`w-full border rounded px-3 py-2 mb-1 ${
                subCategoryError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {subCategoryError && (
              <p className="text-red-500 text-sm mb-2">{subCategoryError}</p>
            )}

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                {editingSubcategory ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
