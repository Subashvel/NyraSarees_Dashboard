import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./couponApi";

interface CouponItem {
  id: number;
  couponCodeName: string;
  minimumPurchaseAmount: number;
  discountUnit: "percentage" | "flat";
  discountValue: number;
  startDate: string;
  endDate: string;
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  const [formData, setFormData] = useState({
    couponCodeName: "",
    minimumPurchaseAmount: 0,
    discountUnit: "percentage",
    discountValue: 0,
    startDate: "",
    endDate: "",
  });

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to load coupons");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for Add/Edit
  const openModal = (coupon?: CouponItem) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({ ...coupon });
    } else {
      setEditingCoupon(null);
      setFormData({
        couponCodeName: "",
        minimumPurchaseAmount: 0,
        discountUnit: "percentage",
        discountValue: 0,
        startDate: "",
        endDate: "",
      });
    }
    setShowModal(true);
  };

  // Save (Create / Update)
  const handleSave = async () => {
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, formData);
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(formData);
        toast.success("Coupon created successfully");
      }
      fetchCoupons();
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Delete
  const handleDelete = (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the coupon",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCoupon(id);
          toast.success("Coupon deleted");
          fetchCoupons();
        } catch (error) {
          toast.error("Failed to delete coupon");
        }
      }
    });
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Coupons</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => openModal()}
        >
          + Add Coupon
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Min. Purchase</th>
              <th className="px-4 py-2">Discount</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border">
                <td className="px-4 py-2">{coupon.couponCodeName}</td>
                <td className="px-4 py-2">{coupon.minimumPurchaseAmount}</td>
                <td className="px-4 py-2">
                  {coupon.discountUnit === "percentage"
                    ? `${coupon.discountValue}%`
                    : `₹${coupon.discountValue}`}
                </td>
                <td className="px-4 py-2">{coupon.startDate}</td>
                <td className="px-4 py-2">{coupon.endDate}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => openModal(coupon)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center sss ccc">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingCoupon ? "Edit Coupon" : "Add Coupon"}
            </h3>

            <input
              type="text"
              name="couponCodeName"
              placeholder="Coupon Code"
              value={formData.couponCodeName}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />

            <input
              type="number"
              name="minimumPurchaseAmount"
              placeholder="Minimum Purchase"
              value={formData.minimumPurchaseAmount}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />

            <select
              name="discountUnit"
              value={formData.discountUnit}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>

            <input
              type="number"
              name="discountValue"
              placeholder="Discount Value"
              value={formData.discountValue}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />

            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />

            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleSave}
              >
                {editingCoupon ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
