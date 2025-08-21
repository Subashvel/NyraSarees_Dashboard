import axios from "axios";

const API_URL = "http://localhost:5000/api/products"; 


// Get all categories
export const getProducts = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Create a new category (with file upload)
export const createProduct = async (formData: FormData) => {
  const res = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Get a single category by ID
export const getProductById = async (id: number | string) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// Update category
export const updateProduct = async (id: number | string, formData: FormData) => {
  const res = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Delete category
export const deleteProduct = async (id: number | string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
