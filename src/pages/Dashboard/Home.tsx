import { useEffect, useState } from "react";

import { getHomeBanners } from "../../components/homebanner/homebannerApi";
import { getUsers } from "../../components/customer/customerApi";
import { getCategories } from "../../components/categories/categoryApi";
import { getSubCategories } from "../../components/subCategories/subCategoryApi";
import { getProductVariants } from "../../components/ProductVariant/productVariantApi";
import { useNavigate } from "react-router-dom";
import { getCollectionBanners } from "../../components/CollectionBanner/CollectionBannerApi"

interface DashboardCardProps {
  color: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  path: string;
}
export default function Dashboard() {
  const [counts, setCounts] = useState({
    categories: 0,
    subCategories: 0,
    productVariants: 0,
    bannerImages: 0,
    customers: 0,
    CollectionBanners: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [categories, subCategories, productVariants, banners, customers, collections] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getProductVariants(),
          getHomeBanners(),
          getUsers(),
          getCollectionBanners(),
        ]);

        setCounts({
          categories: categories.data ? categories.data.length : categories.length,
          subCategories: subCategories.data ? subCategories.data.length : subCategories.length,
        productVariants: productVariants.data ? productVariants.data.length : productVariants.length,
          bannerImages: banners.length,
          customers: customers.length,
          CollectionBanners : collections.length,
          
        });
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
            <DashboardCard color="bg-green-600" title="Category" value={counts.categories} icon="📂" path="/categories" />
      <DashboardCard color="bg-red-600" title="Sub Category" value={counts.subCategories} icon="🛒" path="/subcategories" />
      <DashboardCard color="bg-orange-600" title="Product Variant" value={counts.productVariants} icon="📦" path="/product-variants" />
      <DashboardCard color="bg-blue-600" title="Banner Images" value={counts.bannerImages} icon="🖼️" path="/homebanner" />
      <DashboardCard color="bg-purple-600" title="Customers" value={counts.customers} icon="👨‍💼" path="/customers" />
      <DashboardCard color="bg-yellow-600" title="Collection Banner Images" value={counts.CollectionBanners} icon="🖼️" path="/collectionbanner" />
    </div>
  );
}

function DashboardCard({ color, title, value, icon, path }: DashboardCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className={`${color} rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-white cursor-pointer transition-transform hover:scale-105`}
    >
      <span className="text-3xl">{icon}</span>
      <h3 className="text-lg font-semibold mt-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}


