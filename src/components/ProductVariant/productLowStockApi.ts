import axios from "axios";

export const getLowStockProducts = async () => {
  const res = await axios.get('http://localhost:5000/api/low-stock');
  return res.data.data || [];
};
