import axios from "axios";
export const BASE_URL = 'http://localhost:5000/api/product-variants';

export const getCategories = async () => {
  const res = await axios.get('http://localhost:5000/api/categories');
  return res.data; 
};

export const getSubCategories = async () => {
  const res = await axios.get('http://localhost:5000/api/subcategories');
  return res.data;
};

export const getProducts = async () => {
  const res = await axios.get('http://localhost:5000/api/products'); 
  return res.data;
};

export const getProductVariants = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const createProductVariant = async (formData: FormData) => {
  const res = await axios.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProductVariant = async (id: number | string, formData: FormData) => {
  const res = await axios.put(`${BASE_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProductVariant = async (id: number | string) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};
