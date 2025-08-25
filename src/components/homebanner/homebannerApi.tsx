import axios from "axios";
export const BASE_URL = "http://localhost:5000/api/home-banners";
export const getHomeBanners = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const createHomeBanner = async (formData: FormData) => {
  const res = await axios.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateHomeBanner = async (id: number | string, formData: FormData) => {
  const res = await axios.put(`${BASE_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteHomeBanner = async (id: number) => {
    const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};
