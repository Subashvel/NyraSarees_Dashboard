import axios from "axios";

const BASE_URL = "http://localhost:5000/api/product-variant-images";

/**
 * Upload multiple child images for a product variant
 * @param variantId - The ID of the product variant
 * @param images - Array of image files
 */
export const uploadChildImages = async (variantId: number, images: File[]) => {
  const formData = new FormData();
  formData.append("variantId", variantId.toString());
  
  images.forEach((file) => {
    if (file instanceof File) {
      formData.append("childImages", file);
    }
  });

  const response = await axios.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Fetch child images for a specific variant
 * @param variantId - The ID of the product variant
 */
export const getChildImages = async (variantId: number) => {
  const response = await axios.get(`${BASE_URL}/${variantId}`);
  return response.data;
};

/**
 * Delete a specific child image
 * @param childImageId - The ID of the child image
 */
export const deleteChildImage = async (childImageId: number) => {
  const response = await axios.delete(`${BASE_URL}/${childImageId}`);
  return response.data;
};
