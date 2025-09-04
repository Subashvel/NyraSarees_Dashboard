
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from "../../components/coupon/couponApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [errors, setErrors] = useState({
    couponCodeName: "",
    minimumPurchaseAmount: "",
    discountUnit: "",
    discountValue: "",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState({
    couponCodeName: "",
    minimumPurchaseAmount: 0,
    discountUnit: "percentage",
    discountValue: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
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
  // Handle form change
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });

  let errorMsg = "";

  if (name === "couponCodeName") {
    if (!value) {
      errorMsg = "Coupon Code Field is required";
    } else if (value.length < 4) {
      errorMsg = "Coupon Code should be at minimum 4 characters";
    }
  }

  if (name === "minimumPurchaseAmount") {
    if (!value) {
      errorMsg = "Minimum amount of purchase is required";
    } else if (!/^\d+$/.test(value)) {
      errorMsg = "Minimum amount of purchase must be a number";
    } else if (value.length > 10) {
      errorMsg = "Minimum Purchase cannot exceed 10 digits";
    }
  }

  if (name === "discountValue") {
    if (!value) {
      errorMsg = "Discount Value is required";
    } else if (!/^\d+$/.test(value)) {
      errorMsg = "Discount Value must be a number";
    } else if (formData.discountUnit === "percentage") {
      if (Number(value) < 1 || Number(value) > 100) {
        errorMsg = "Percentage must be between 1 and 100";
      }
    } else if (formData.discountUnit === "flat") {
      if (Number(value) > Number(formData.minimumPurchaseAmount)) {
        errorMsg = "Flat discount cannot exceed Minimum Purchase Amount";
      }
    }
  }

  setErrors((prev) => ({ ...prev, [name]: errorMsg }));
};

const handleDateChange = (name: "startDate" | "endDate", date: Date | null) => {
  setFormData((prev) => ({ ...prev, [name]: date }));

  let errorMsg = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!date) {
    errorMsg = "Date field is required";
  } else if (name === "startDate" && date < today) {
    errorMsg = "Start Date cannot be before today";
  } else if (name === "endDate" && formData.startDate && date < formData.startDate) {
    errorMsg = "End Date must be after Start Date";
  }

  setErrors((prev) => ({ ...prev, [name]: errorMsg }));
};


  // Open modal for Add/Edit
  const openModal = (coupon?: CouponItem) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({ ...coupon, startDate: new Date(coupon.startDate), endDate: new Date(coupon.endDate) });
    } else {
      setEditingCoupon(null);
      setFormData({
        couponCodeName: "",
        minimumPurchaseAmount: 0,
        discountUnit: "percentage",
        discountValue: 0,
        startDate: null as Date | null,
        endDate: null as Date | null,
      });
    }
    setShowModal(true);
  };

  // Save (Create / Update)
  // Save (Create / Update)
const handleSave = async () => {
  let newErrors = {
    couponCodeName: "",
    minimumPurchaseAmount: "",
    discountUnit: "",
    discountValue: "",
    startDate: "",
    endDate: "",
  };
  let isValid = true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Coupon code
  if (!formData.couponCodeName) {
    newErrors.couponCodeName = "Coupon Code Field is required";
    isValid = false;
  } else if (formData.couponCodeName.length < 4) {
    newErrors.couponCodeName = "Coupon Code should be at minimum 4 characters";
    isValid = false;
  }

  // Min purchase
  if (!formData.minimumPurchaseAmount) {
    newErrors.minimumPurchaseAmount = "Minimum amount of purchase is required";
    isValid = false;
  } else if (isNaN(Number(formData.minimumPurchaseAmount))) {
    newErrors.minimumPurchaseAmount = "Minimum amount of purchase must be a number";
    isValid = false;
  } else if (formData.minimumPurchaseAmount.toString().length > 10) {
    newErrors.minimumPurchaseAmount = "Minimum amount of purchase cannot exceed 10 digits";
    isValid = false;
  }

  // Discount unit
  if (!formData.discountUnit) {
    newErrors.discountUnit = "Discount Field is required";
    isValid = false;
  }

  // Discount value
  if (!formData.discountValue) {
    newErrors.discountValue = "Discount Value is required";
    isValid = false;
  } else if (isNaN(Number(formData.discountValue))) {
    newErrors.discountValue = "Discount Value must be a number";
    isValid = false;
  } else if (formData.discountUnit === "percentage") {
    if (Number(formData.discountValue) < 1 || Number(formData.discountValue) > 100) {
      newErrors.discountValue = "Percentage must be between 1 and 100";
      isValid = false;
    }
  } else if (formData.discountUnit === "flat") {
    if (Number(formData.discountValue) > Number(formData.minimumPurchaseAmount)) {
      newErrors.discountValue = "Flat discount cannot exceed Minimum Purchase Amount";
      isValid = false;
    }
  }

  // Dates
  if (!formData.startDate) {
    newErrors.startDate = "Start Date is required";
    isValid = false;
  } else if (formData.startDate < today) {
    newErrors.startDate = "Start Date cannot be before today";
    isValid = false;
  }

  if (!formData.endDate) {
    newErrors.endDate = "End Date is required";
    isValid = false;
  } else if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
    newErrors.endDate = "End Date must be after Start Date";
    isValid = false;
  }

  setErrors(newErrors);
  if (!isValid) return;

  try {
    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, formData);
    } else {
      await createCoupon(formData);
    }
    fetchCoupons();
    setShowModal(false);
  } catch {
    toast.error("Failed to save coupon");
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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="space-y-6">
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
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Min. Purchase</th>
              <th className="px-4 py-2">Discount</th>
              <th className="px-4 py-2">Start Date</th>
              <th className="px-4 py-2">End Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, index) => (
              <tr key={coupon.id} className="border">
                <td className="px-4 py-2">{index + 1}</td>
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
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center sss ccc z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingCoupon ? "Edit Coupon" : "Add Coupon"}
            </h3>
            <label className="block mb-1 text-sm">Coupon Code Name</label>
            <input
              type="text"
              name="couponCodeName"
              value={formData.couponCodeName}
              onChange={handleChange}
              className={`border p-2 w-full mb-1 ${
                errors.couponCodeName ? "border-red-500" : ""
              }`}
            />
            {errors.couponCodeName && (
              <p className="text-red-500 text-sm">{errors.couponCodeName}</p>
            )}

            <label className="block mb-1 text-sm">
              Minimum amount of purchase
            </label>
            <input
              type="text"
              name="minimumPurchaseAmount"
              // maxLength={10}
              placeholder="Minimum Purchase"
              value={formData.minimumPurchaseAmount}
              onChange={handleChange}
              className={`border p-2 w-full mb-1 ${
                errors.minimumPurchaseAmount ? "border-red-500" : ""
              }`}
            />
            {errors.minimumPurchaseAmount && (
              <p className="text-red-500 text-sm">
                {errors.minimumPurchaseAmount}
              </p>
            )}
            <label className="block mb-1 text-sm">Discount Unit</label>
            <select
              name="discountUnit"
              value={formData.discountUnit}
              onChange={handleChange}
              className={`border p-2 w-full mb-1 ${
                errors.discountUnit ? "border-red-500" : ""
              }`}
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Rupees</option>
            </select>
            {errors.discountUnit && (
              <p className="text-red-500 text-sm">{errors.discountUnit}</p>
            )}
            <label className="block mb-1 text-sm">Discounted Value</label>
            <input
              type="text"
              name="discountValue"
              placeholder="Discount Value"
              value={formData.discountValue}
              onChange={handleChange}
              className={`border p-2 w-full mb-1 ${
                errors.discountValue ? "border-red-500" : ""
              }`}
            />
            {errors.discountValue && (
              <p className="text-red-500 text-sm">{errors.discountValue}</p>
            )}
            <label className="block mb-1 text-sm">Start Date</label>
            <DatePicker
  selected={formData.startDate}
  onChange={(date) => handleDateChange("startDate", date)}
  className={`border p-2 w-full mb-1 ${errors.startDate ? "border-red-500" : ""}`}
  dateFormat="yyyy-MM-dd"
/>
{errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}

            <label className="block mb-1 text-sm">End Date</label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => handleDateChange("endDate", date)}
              className={`border p-2 w-full mb-1 ${errors.endDate ? "border-red-500" : ""}`}
              dateFormat="yyyy-MM-dd"
            />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}

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
    </div>
    </div>
  );
};

export default Coupons;
