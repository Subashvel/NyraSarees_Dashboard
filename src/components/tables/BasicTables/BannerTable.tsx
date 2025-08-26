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

interface BannerItem {
  id: number;
  image: string;
}

export default function BasicTableOne() {
  const [bannerData, setBannerData] = useState<BannerItem[]>([
    { id: 1, image: "https://via.placeholder.com/1920x600?text=Banner+1" },
    { id: 2, image: "https://via.placeholder.com/1920x600?text=Banner+2" },
    { id: 3, image: "https://via.placeholder.com/1920x600?text=Banner+3" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    const newBanner: BannerItem = {
      id: bannerData.length + 1,
      image: URL.createObjectURL(file),
    };

    setBannerData((prev) => [...prev, newBanner]);
    setFile(null);
    setShowModal(false);
    toast.success("Banner added successfully!");
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
        setBannerData((prev) => prev.filter((b) => b.id !== id));
        toast.success("Banner deleted successfully!");
      }
    });
  };

  const handleEdit = (_id: number) => {
    
    toast.success("Banner updated successfully!");
  };

  return (
    <>
      
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          + Add Banner Web Image
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 border-b border-gray-200">
              <TableRow>
                <TableCell isHeader className="px-6 py-3 font-semibold text-gray-700 text-sm">
                  Web Banner Image
                </TableCell>
                <TableCell isHeader className="px-6 py-3 font-semibold text-gray-700 text-sm">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {bannerData.length === 0 ? (
                <TableRow>
                  <td className="px-6 py-4 text-center" colSpan={2}>
                    No banners found.
                  </td>
                </TableRow>
              ) : (
                bannerData.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="px-6 py-4">
                      <div className="w-40 h-16 overflow-hidden rounded-lg border border-gray-300">
                        <img
                          src={banner.image}
                          alt={`Banner ${banner.id}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(banner.id)}
                          className="px-4 py-1.5 rounded-md bg-gray-600 text-white text-sm hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Add Banner Image</h2>
            <label className="block text-sm text-red-600 mb-2">
              Banner Image <span>(1920px X 600px) (Only png, jpg, jpeg)</span>
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
