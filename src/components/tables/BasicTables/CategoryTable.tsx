// Without image preview and image baseurl

// import { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "../../ui/table";
// import Swal from "sweetalert2";
// import toast from "react-hot-toast";
// import {
//   getCategories,
//   createCategory,
//   deleteCategory,
//   updateCategory,
// } from "../../../api/categoryApi";

// interface CategoryItem {
//   id: number;
//   categoryName: string;
//   categoryImage: string;
//   categoryBanner: string;
// }

// export default function CategoryTable() {
//   const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
//   const [showModal, setShowModal] = useState(false);
//   const [categoryBanner, setcategoryBanner] = useState<File | null>(null);
//   const [categoryImage, setcategoryImage] = useState<File | null>(null);
//   const [newCategory, setNewCategory] = useState({ categoryName: "" });
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const data = await getCategories();
//       setCategoryData(data);
//     } catch (error) {
//       toast.error("Failed to load categories");
//       console.error("Error:")
//     }
//   };

//   const handleSubmit = async () => {
//   if (!newCategory.categoryName || !categoryBanner || !categoryImage) {
//     toast.error("Please provide category name, banner, and image.");
//     return;
//   }

//   const formData = new FormData();

//   // Serial number logic
//   if (editingId) {
//     // For updates, find the original serialNumber from categoryData
//     const originalCategory = categoryData.find((cat) => cat.id === editingId);
//     if (originalCategory) {
//       formData.append("serialNumber", String(categoryData.indexOf(originalCategory) + 1));
//     }
//   } else {
//     // For new category, just take next number in sequence
//     formData.append("serialNumber", String(categoryData.length + 1));
//   }

//   formData.append("categoryName", newCategory.categoryName);
//   formData.append("categoryBanner", categoryBanner);
//   formData.append("categoryImage", categoryImage);

//   try {
//     if (editingId) {
//       await updateCategory(editingId, formData);
//       toast.success("Category updated successfully!");
//     } else {
//       await createCategory(formData);
//       toast.success("Category added successfully!");
//     }
//     setShowModal(false);
//     resetForm();
//     fetchCategories();
//   } catch (err) {
//     toast.error("Failed to save category");
//     console.error("Error:", err);
//   }
// };

//   const handleDelete = (id: number) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This will permanently delete the category.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await deleteCategory(id);
//           toast.success("Category deleted successfully!");
//           fetchCategories();
//         } catch {
//           toast.error("Failed to delete");
//         }
//       }
//     });
//   };

//   const handleEdit = (item: CategoryItem) => {
//     setEditingId(item.id);
//     setNewCategory({ categoryName: item.categoryName });
//     setcategoryBanner(null);
//     setcategoryImage(null);
//     setShowModal(true);
//   };

//   const resetForm = () => {
//     setNewCategory({ categoryName: "" });
//     setcategoryBanner(null);
//     setcategoryImage(null);
//     setEditingId(null);
//   };

//   const filteredData = categoryData.filter((item) =>
//     item.categoryName.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <>
//       {/* Search + Add */}
//       <div className="mb-4 flex flex-wrap gap-4 items-center">
//         <input
//           type="text"
//           placeholder="Search categories..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-2"
//         />
//         <button
//           onClick={() => {
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
//         >
//           + Add Category
//         </button>
//       </div>

//       {/* Table */}
//       <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
//         <div className="max-w-full overflow-x-auto">
//           <Table>
//             <TableHeader className="bg-gray-100 border-b border-gray-200">
//               <TableRow>
//                 <TableCell isHeader>S.NO</TableCell>
//                 <TableCell isHeader>Category Name</TableCell>
//                 <TableCell isHeader>Category Image</TableCell>
//                 <TableCell isHeader>Category Banner</TableCell>
//                 <TableCell isHeader>Action</TableCell>
//               </TableRow>
//             </TableHeader>
//             <TableBody className="divide-y divide-gray-200">
//               {filteredData.length === 0 ? (
//                 <TableRow>
//                   <td colSpan={5} className="px-6 py-4 text-center">
//                     No categories found.
//                   </td>
//                 </TableRow>
//               ) : (
//                 filteredData.map((item, index) => (
//                   <TableRow key={item.id}>
//                     <TableCell>{index + 1}</TableCell>
//                     <TableCell>{item.categoryName}</TableCell>
//                     <TableCell>
//                       <img
//                         src={item.categoryImage}
//                         alt={item.categoryName}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <img
//                         src={item.categoryBanner}
//                         alt={item.categoryName}
//                         className="w-16 h-16 object-cover rounded"
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleEdit(item)}
//                           className="px-4 py-1.5 rounded-md bg-yellow-500 text-white text-sm hover:bg-yellow-600"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleDelete(item.id)}
//                           className="px-4 py-1.5 rounded-md bg-red-500 text-white text-sm hover:bg-red-600"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//             >
//               ✕
//             </button>
//             <h2 className="text-lg font-semibold mb-4">
//               {editingId ? "Edit Category" : "Add Category"}
//             </h2>

//             <label className="block mb-1 text-sm">Category Name</label>
//             <input
//               type="text"
//               value={newCategory.categoryName}
//               onChange={(e) =>
//                 setNewCategory({ categoryName: e.target.value })
//               }
//               className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
//             />

//             <label className="block mb-1 text-sm">Category Banner</label>
//             <input
//               type="file"
//               accept="image/png, image/jpeg"
//               onChange={(e) => e.target.files && setcategoryBanner(e.target.files[0])}
//               className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
//             />

//             <label className="block mb-1 text-sm">Category Image</label>
//             <input
//               type="file"
//               accept="image/png, image/jpeg"
//               onChange={(e) => e.target.files && setcategoryImage(e.target.files[0])}
//               className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
//             />

//             <div className="mt-4 flex justify-center">
//               <button
//                 onClick={handleSubmit}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
//               >
//                 {editingId ? "Update" : "Submit"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../../api/CategoryApi";

interface CategoryItem {
  id: number;
  categoryName: string;
  categoryImage: string;
  categoryBanner: string;
}

const imageBaseUrl =
  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";

export default function CategoryTable() {
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [categoryBanner, setCategoryBanner] = useState<File | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState({ categoryName: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCategoryImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCategoryBanner(file);
    if (file) setBannerPreview(URL.createObjectURL(file));
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      const updatedData = data.map((cat: CategoryItem) => ({
        ...cat,
        categoryImage: cat.categoryImage?.startsWith("http")
          ? cat.categoryImage
          : `${imageBaseUrl}/${cat.categoryImage}`,
        categoryBanner: cat.categoryBanner?.startsWith("http")
          ? cat.categoryBanner
          : `${imageBaseUrl}/${cat.categoryBanner}`,
      }));
      setCategoryData(updatedData);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error("Error:", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !newCategory.categoryName ||
      (!categoryBanner && !editingId) ||
      (!categoryImage && !editingId)
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formData = new FormData();

    if (editingId) {
      const originalCategory = categoryData.find((cat) => cat.id === editingId);
      if (originalCategory) {
        formData.append(
          "serialNumber",
          String(categoryData.indexOf(originalCategory) + 1)
        );
      }
    } else {
      formData.append("serialNumber", String(categoryData.length + 1));
    }

    formData.append("categoryName", newCategory.categoryName);
    if (categoryBanner) formData.append("categoryBanner", categoryBanner);
    if (categoryImage) formData.append("categoryImage", categoryImage);

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success("Category updated successfully!");
      } else {
        await createCategory(formData);
        toast.success("Category added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category");
      console.error("Error:", err);
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

  const handleEdit = (item: CategoryItem) => {
    setEditingId(item.id);
    setNewCategory({ categoryName: item.categoryName });

    // Reset file inputs
    setCategoryBanner(null);
    setCategoryImage(null);

    // Show existing previews
    setBannerPreview(item.categoryBanner || null);
    setImagePreview(item.categoryImage || null);

    setShowModal(true);
  };

  const resetForm = () => {
    setNewCategory({ categoryName: "" });
    setCategoryBanner(null);
    setCategoryImage(null);
    setEditingId(null);
    setBannerPreview(null);
    setImagePreview(null);
  };

  const filteredData = categoryData.filter((item) =>
    item.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Search + Add */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Category
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 border-b border-gray-200">
              <TableRow>
                <TableCell isHeader>S.NO</TableCell>
                <TableCell isHeader>Category Name</TableCell>
                <TableCell isHeader>Category Image</TableCell>
                <TableCell isHeader>Category Banner</TableCell>
                <TableCell isHeader>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <TableRow>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No categories found.
                  </td>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>
                      <img
                        src={item.categoryImage}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={item.categoryBanner}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-4 py-1.5 rounded-md bg-yellow-500 text-white text-sm hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-4 py-1.5 rounded-md bg-red-500 text-white text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 sss">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            <label className="block mb-1 text-sm">Category Name</label>
            <input
              type="text"
              value={newCategory.categoryName}
              onChange={(e) => setNewCategory({ categoryName: e.target.value })}
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />

            <label className="block mt-3 mb-1 text-sm">Category Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image Preview"
                className="w-20 mt-2 rounded"
              />
            )}

            <label className="block mt-3 mb-1 text-sm">Category Banner</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleBannerChange}
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt="Banner Preview"
                className="w-20 mt-2 rounded"
              />
            )}

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                {editingId ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
