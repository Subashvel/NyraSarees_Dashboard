import axios from "axios";

const API_URL = "http://localhost:5000/api/product-stock";

export const getCategories = async () => {
  const res = await axios.get('http://localhost:5000/api/categories');
  return res.data; 
};

export const getProducts = async () => {
  const res = await axios.get('http://localhost:5000/api/products'); 
  return res.data;
};

export const getStock = async (productVariantId: number) => {
  const res = await axios.get(`${API_URL}/${productVariantId}`);
  return res.data;
};

export const addStock = async (productVariantId: number, quantity: number) => {
  const res = await axios.post(`${API_URL}/add`, { productVariantId, quantity });
  return res.data;
};

export const reduceStock = async (productVariantId: number, quantity: number) => {
  const res = await axios.post(`${API_URL}/reduce`, { productVariantId, quantity });
  return res.data;
};
