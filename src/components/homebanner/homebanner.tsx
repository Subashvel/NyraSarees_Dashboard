import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getHomeBanners,
  createHomeBanner,
  updateHomeBanner,
  deleteHomeBanner,
} from "./homebannerApi";

const imageBaseUrl = `http://localhost:5000/uploads/`;
export default function HomeBannerManager() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getHomeBanners();
      if (Array.isArray(data)) setBanners(data);
    } catch {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner: any = null) => {
    setEditBanner(banner);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditBanner(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!imageFile && !editBanner) {
      toast.error("Please select an image");
      return;
    }
    if (imageError) {
      toast.error("Please fix image errors before submitting");
      return;
    }

    const formData = new FormData();
    if (imageFile) formData.append("bannerImage", imageFile);

    try {
      if (editBanner) {
        await updateHomeBanner(editBanner.id, formData);
        toast.success("Banner updated successfully");
      } else {
        await createHomeBanner(formData);
        toast.success("Banner created successfully");
      }
      handleCloseModal();
      fetchBanners();
    } catch {
      toast.error("Failed to save banner");
    }
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteHomeBanner(id);
          toast.success("Banner deleted");
          fetchBanners();
        } catch {
          toast.error("Delete failed");
        }
      }
    });
  };

  const validateImage = (file: File) => {
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width === 726 && img.height === 967) {
          setImageError(null);
          resolve(true);
        } else {
          setImageError("Image must be exactly 726 × 967 pixels.");
          resolve(false);
        }
      };
    });
  };
  

  return (
    <div
      className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Home Banners</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          + Add Banner
        </button>
      </div>

      {loading ? (
        <p>Loading banners...</p>
      ) : (
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr className="bg-gray-100">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Banner Image</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? (
              banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="px-4 py-2">{banner.id}</td>
                  <td className="px-4 py-2">
                    <img
                      src={
                        banner.bannerImage.startsWith("http")
                          ? banner.bannerImage
                          : imageBaseUrl + banner.bannerImage
                      }
                      alt="Banner"
                      className="w-32 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(banner)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
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
                <td colSpan={3} className="p-4 text-center">
                  No banners found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 ccc sss">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {editBanner ? "Edit Banner" : "Add Banner"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Banner Image</label>
                <input
  type="file"
  className="focus:border-ring-brand-300 h-11 w-auto overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const isValid = await validateImage(file);
      if (isValid) {
        setImageFile(file);
      } else {
        setImageFile(null);
      }
    } else {
      setImageFile(null);
      setImageError(null);
    }
  }}
/>
{imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                {(imageFile || editBanner?.bannerImage) && (
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : editBanner?.bannerImage.startsWith("http")
                        ? editBanner.bannerImage
                        : imageBaseUrl + editBanner?.bannerImage
                    }
                    alt="Preview"
                    className="mt-2 w-32 h-16 object-cover rounded"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  {editBanner ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
