import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProductDetailsPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`);
      const data = await res.json();
      if (data.success) setProduct(data.product);
      else toast.error("Product not found");
    } catch {
      toast.error("Failed to load product details");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{product.productname}</h2>
{product.image || product.product_variant_image ? (
  <img
    src={`http://localhost:5000/uploads/${product.image || product.product_variant_image}`}
    alt={product.productname}
    className="w-64 h-64 object-cover rounded"
  />
) : (
  <p>No Image Available</p>
)}


      <p className="mt-4">Quantity: {product.quantity}</p>
      <p className="mt-2">Total Price: {product.total_price}</p>
    </div>
  );
}
