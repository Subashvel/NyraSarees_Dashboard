
// import PageBreadcrumb from "../components/common/PageBreadCrumb";


import PageMeta from "../components/common/PageMeta";
import ProductVariants from "../components/ProductVariant/ProductVariants";



export default function ProductVariant() {
  return (
    <>
      <PageMeta
        title="Dashboard"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {/* <PageBreadcrumb pageTitle="Profile" /> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}
        <div className="space-y-6">

            <ProductVariants />


        </div>
      </div>
    </>
  );
}
