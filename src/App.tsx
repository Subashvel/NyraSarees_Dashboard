import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";

import BasicTableOne from "./components/tables/BasicTables/BasicTableOne";
// import BannerTable from "./components/tables/BasicTables/BannerTable";
// import UserTable from "./components/tables/BasicTables/UserTable";
// import CategoryTable from "./components/tables/BasicTables/CategoryTable";
// import ProductTable from "./components/tables/BasicTables/ProductTable";
// import ProductVariant from "./components/tables/BasicTables/ProductVariant";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Variants from "./pages/Variants";
import Homebanner from "./pages/Homebanner";
import SubCategories from "./pages/SubCategories";
import ProductVariant from "./pages/ProductVariant";
import CustomerTable from "./components/customer/customer";
import Coupons from "./components/coupon/coupon";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/basic-table-one" element={<BasicTableOne />} />
            {/* <Route path="/banner-table" element={<BannerTable />} /> */}
            {/* <Route path="/user-table" element={<UserTable />} /> */}
            {/* <Route path="/category-table" element={<CategoryTable />} /> */}
            {/* <Route path="/product-table" element={<ProductTable />} /> */}
            {/* <Route path="/product-variant" element={<ProductVariant />} /> */}

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />



            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subcategories" element={<SubCategories />} />
            <Route path="/variants" element={<Variants />} />
            <Route path="/homebanner" element={<Homebanner />} />
            <Route path="/product-variants" element={<ProductVariant />} />
            <Route path="/customers" element={<CustomerTable />} />

          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

          {/* Products */}

          <Route path="/coupons" element={<Coupons />} />
        </Routes>
      </Router>
    </>
  );
}
