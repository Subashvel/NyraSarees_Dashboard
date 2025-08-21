const BASE_URL = "http://localhost:5000/api/subcategories";

export const getCategories = async () => {
  const res = await fetch('http://localhost:5000/api/categories');
  return res.json();
};

export const getSubCategories = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  return res.json();
};

export const createSubCategory = async (
  categoryId: number,
  subCategoryName: string
) => {
  console.log("Payload:", { categoryId, subCategoryName });
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId, subCategoryName }),
  });
  if (!res.ok) throw new Error("Failed to create subcategory");
  return res.json();
};


export const updateSubCategory = async (
  id: number,
  categoryId: number,
  subCategoryName: string
) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId, subCategoryName }),
  });
  if (!res.ok) throw new Error("Failed to update subcategory");
  return res.json();
};

export const deleteSubCategory = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete subcategory");
  return res.json();
};
