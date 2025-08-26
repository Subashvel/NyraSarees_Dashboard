import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryApi";

interface CategoryItem {
  categoryId: number;
  categoryName: string;
  // createdAt: string;
  updatedAt: string;
}

export default function CategoryComponents() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null
  );
  const [categoryName, setCategoryName] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateCategoryName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return "Category name is required";
    if (trimmed && trimmed.length < 3) {
      return "Category Name should be at least 3 characters long";
    }
    if (trimmed.length > 50) {
      return "Category Name must not go beyond 50 characters";
    }
    return "";
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const json = await getCategories();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      // toast.error("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryName(cat.categoryName);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const errorMsg = validateCategoryName(categoryName);
    if (errorMsg) {
      setValidationError(errorMsg); // Show inline error
      return;
    }

    setValidationError("");

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryId, categoryName.trim());
        toast.success("Category updated successfully!");
      } else {
        await createCategory(categoryName.trim());
        toast.success("Category added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category");
      console.error(err);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(id);
          toast.success("Category deleted successfully!");
          fetchCategories();
        } catch {
          toast.error("Failed to delete");
        }
      }
    });
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button
          onClick={openAddModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2">S.NO</th>
              <th className="px-4 py-2">Category Name</th>
              {/* <th className="px-4 py-2">Created At</th> */}
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.categoryId} className="border-b">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{cat.categoryName}</td>
                  {/* <td className="px-4 py-2">
                    {new Date(cat.createdAt).toLocaleString()}
                  </td> */}
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.categoryId)}
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
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <label className="block mb-1 text-sm">Category Name</label>
            <input
              type="text"
              value={categoryName}
              // maxLength={50}
              onChange={(e) => {
                const value = e.target.value;
                setCategoryName(value);
                setValidationError(validateCategoryName(value)); // Validate on every change
              }}
              className={`w-full border rounded px-3 py-2 mb-1 ${
                validationError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {validationError && (
              <p className="text-red-500 text-sm mb-2">{validationError}</p>
            )}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                {editingCategory ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
