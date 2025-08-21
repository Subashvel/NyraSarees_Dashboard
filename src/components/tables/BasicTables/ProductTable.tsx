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
  getProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../../../api/ProductApi";

interface ProductItem {
  id: number;
  serialNumber: number;
  categoryName: string;
  productName: string;
  productImage: string;
  productBanner: string;
  productDescription: string;
}

const imageBaseUrl =
  import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:5000";

export default function ProductTable() {
  const [productData, setProductData] = useState<ProductItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productBanner, setProductBanner] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    categoryName: "",
    productName: "",
    productDescription: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProductImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProductBanner(file);
    if (file) setBannerPreview(URL.createObjectURL(file));
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      const updatedData = data.map((prod: ProductItem) => ({
        ...prod,
        productImage: prod.productImage?.startsWith("http")
          ? prod.productImage
          : `${imageBaseUrl}/${prod.productImage}`,
        productBanner: prod.productBanner?.startsWith("http")
          ? prod.productBanner
          : `${imageBaseUrl}/${prod.productBanner}`,
      }));
      setProductData(updatedData);
    } catch (error) {
      toast.error("Failed to load products");
      console.error("Error:", error);
    }
  };

  const handleSubmit = async () => {
    if (
      !newProduct.categoryName ||
      !newProduct.productName ||
      !productBanner ||
      !productImage
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formData = new FormData();

    if (editingId) {
      const originalProduct = productData.find((p) => p.id === editingId);
      if (originalProduct) {
        formData.append(
          "serialNumber",
          String(productData.indexOf(originalProduct) + 1)
        );
      }
    } else {
      formData.append("serialNumber", String(productData.length + 1));
    }

    formData.append("categoryName", newProduct.categoryName);
    formData.append("productName", newProduct.productName);
    formData.append("productDescription", newProduct.productDescription);
    if (productBanner) {
      formData.append("productBanner", productBanner);
    }

    if (productImage) {
      formData.append("productImage", productImage);
    }

    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(formData);
        toast.success("Product added successfully!");
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error("Failed to save product");
      console.error("Error:", err);
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

  const handleEdit = (item: ProductItem) => {
    setEditingId(item.id);
    setNewProduct({
      categoryName: item.categoryName,
      productName: item.productName,
      productDescription: item.productDescription,
    });

    setProductBanner(null);
    setProductImage(null);

    // Set previews from existing product URLs
    setBannerPreview(item.productBanner || null);
    setImagePreview(item.productImage || null);

    // Open modal
    setShowModal(true);
  };

  const resetForm = () => {
    setNewProduct({
      categoryName: "",
      productName: "",
      productDescription: "",
    });
    setProductBanner(null);
    setProductImage(null);
    setEditingId(null);
    setBannerPreview(null);
    setImagePreview(null);
  };

  const filteredData = productData.filter(
    (item) =>
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Search + Add */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
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
          + Add Product
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
                <TableCell isHeader>Product Name</TableCell>
                <TableCell isHeader>Image</TableCell>
                <TableCell isHeader>Banner</TableCell>
                <TableCell isHeader>Description</TableCell>
                <TableCell isHeader>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No products found.
                  </td>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>
                      <img
                        src={item.productImage}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={item.productBanner}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{item.productDescription}</TableCell>
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
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 "
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <label className="block mb-1 text-sm">Category Name</label>
            <input
              type="text"
              value={newProduct.categoryName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, categoryName: e.target.value })
              }
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />

            <label className="block mb-1 text-sm mt-3">Product Name</label>
            <input
              type="text"
              value={newProduct.productName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productName: e.target.value })
              }
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />

            <label className="block mb-1 text-sm mt-3">
              Product Description
            </label>
            <textarea
              value={newProduct.productDescription}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  productDescription: e.target.value,
                })
              }
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />

            <label className="block mb-1 text-sm mt-3">Product Banner</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleBannerChange}
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />
            {bannerPreview && (
              <img
                src={bannerPreview}
                alt="Preview"
                className="w-20 mt-2 rounded"
              />
            )}

            <label className="block mb-1 text-sm mt-3">Product Image</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 custom-class"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
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
