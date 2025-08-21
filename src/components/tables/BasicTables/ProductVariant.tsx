import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface ProductItem {
  id: number;
  categoryName: string;
  productName: string;
  productImage: string;
  categoryBanner: string;
}

const categories = [
  "Cotton Sarees",
  "Silk Sarees",
  "Half Sarees",
  "Organza Sarees",
  "Linen Sarees",
  "Designer Sarees",
  "Printed Sarees",
];

export default function ProductTable() {
  const [productData, setProductData] = useState<ProductItem[]>([
    {
      id: 1,
      categoryName: "Silk Sarees",
      productName: "Blouse",
      productImage:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Athirasam.JPG/320px-Athirasam.JPG",
      categoryBanner:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Athirasam.JPG/320px-Athirasam.JPG",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    categoryName: "",
    productName: "",
    categoryBanner: "",
  });
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!newProduct.categoryName || !newProduct.productName || !file) {
      toast.error("Please fill all fields and select an image.");
      return;
    }

    const newItem: ProductItem = {
      id: productData.length + 1,
      categoryName: newProduct.categoryName,
      productName: newProduct.productName,
      categoryBanner: URL.createObjectURL(file),
      productImage: URL.createObjectURL(file),
    };

    setProductData((prev) => [...prev, newItem]);
    setFile(null);
    setNewProduct({ categoryName: "", productName: "", categoryBanner: "" });
    setShowModal(false);
    toast.success("Product added successfully!");
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won’t be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#7C3AED",
      cancelButtonColor: "#6B7280",
    }).then((result) => {
      if (result.isConfirmed) {
        setProductData((prev) => prev.filter((p) => p.id !== id));
        toast.success("Product deleted successfully!");
      }
    });
  };

  const handleEdit = (id: number) => {
    toast.success("Product updated successfully!");
  };

  const filteredData = productData.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === "" || item.categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Type a keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Select Category</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 border-b border-gray-200">
              <TableRow>
                <TableCell isHeader>S.NO</TableCell>
                <TableCell isHeader>Category Name</TableCell>
                <TableCell isHeader>Product Name</TableCell>
                <TableCell isHeader>Product Image</TableCell>
                <TableCell isHeader>Product Banner</TableCell>
                <TableCell isHeader>Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="px-6 py-4 text-center">
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
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell><img
                        src={item.categoryBanner}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="px-4 py-1.5 rounded-md bg-gray-600 text-white text-sm hover:bg-gray-700"
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Add Product</h2>

            <label className="block mb-1 text-sm">Category</label>
            <select
              value={newProduct.categoryName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, categoryName: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            >
              <option value="">Select Category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label className="block mb-1 text-sm">Category Size</label>
            <input
              type="text"
              value={newProduct.productName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, productName: e.target.value })
              }
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
            />

            <label className="block mb-1 text-sm">Product Banner
            <span>(Only png, jpg, jpeg)</span>
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />

            <label className="block text-sm text-red-600 mb-2">
              Product Image <span>(Only png, jpg, jpeg)</span>
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />

            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
