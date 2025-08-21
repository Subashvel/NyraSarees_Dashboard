const BASE_URL = "http://localhost:5000/api/products";

export const getCategories = async () => {
  const res = await fetch('http://localhost:5000/api/categories');
  return res.json();
};

export const getSubCategories = async () => {
  const res = await fetch('http://localhost:5000/api/subcategories');
  return res.json();
};


export const getProducts = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const createProduct = async (productData: FormData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    body: productData, // remove JSON.stringify
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
};

export const updateProduct = async (id: number, productData: FormData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: productData,
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
};


export const deleteProduct = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
};
