import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { checkAuth } from "./store/auth-slice/auth";
import { eventBus } from "./utils/eventBus"; // ✅ Import eventBus
import io from "socket.io-client";

import AuthLayout from "./components/auth/AuthLayout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import CheckAuth from "./components/common/CheckAuth";

import AdminLayout from "./components/admin-view/layout";
import AdminDashboard from "./pages/admin-view/dashboard";
import AdminOrders from "./pages/admin-view/orders";
import AdminMenu from "./pages/admin-view/menu";
import AdminTableQR from "./pages/admin-view/table-qr";
import AdminBills from "./pages/admin-view/bills";
import AdminSettings from "./pages/admin-view/settings";
import AdminReports from "./pages/admin-view/reports";
import AdminUpdate from "./pages/admin-view/update-help";
import AdminUser from "./pages/admin-view/user-access";

import KitchenLayout from "./components/kitchen-view/layout";
import KitchenHome from "./pages/kitchen-view/home";
import KitchenSettings from "./pages/kitchen-view/settings";

import StaffLayout from "./components/staff-view/layout";
import StaffHome from "./pages/staff-view/home";
import StaffTable from "./pages/staff-view/table";
import StaffMenu from "./pages/staff-view/menu";
import StaffBill from "./pages/staff-view/Bill";
import CustomerInfo from "./components/staff-view/CustomerInfo";
import StaffPayBill from "./pages/staff-view/PayBill";
import StaffNotifications from "./pages/staff-view/notification";

import Loader from "./components/common/Loader";
import { Toaster } from "react-hot-toast";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  // ✅ Check auth on load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // ✅ Memoized socket with username query
  const socket = useMemo(() => {
    if (!user?.userName) return null;

    const s = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      withCredentials: true,
      query: {
        username: user.userName, // ✅ attach username
      },
    });

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });
    s.on("new-bill", (bill) => {
      eventBus.emit("bill-update", bill);
    });

    s.on("kot-ready", (data) => {
      console.log("🔔 [App] kot-ready received:", data);

      const newNotif = { ...data, timestamp: Date.now() };
      const existing =
        JSON.parse(localStorage.getItem("staff_notifications")) || [];
      const updated = [newNotif, ...existing];

      localStorage.setItem("staff_notifications", JSON.stringify(updated));
      console.log("📦 Notifications saved to localStorage:", updated);

      eventBus.emit("kot-notification", updated);
      console.log("📢 Emitted kot-notification");
    });

    s.on("disconnect", () => {
      console.warn("⚠️ Socket disconnected");
    });

    return s;
  }, [user]);

  // ✅ Cleanup socket on unmount or user change
  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  if (isLoading) return <Loader />;

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="table-qr" element={<AdminTableQR />} />
          <Route path="bills" element={<AdminBills />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="update-help" element={<AdminUpdate />} />
          <Route path="user-access" element={<AdminUser />} />
        </Route>

        {/* Kitchen */}
        <Route
          path="/kitchen"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <KitchenLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<KitchenHome />} />
          <Route path="settings" element={<KitchenSettings />} />
        </Route>

        {/* Staff */}
        <Route
          path="/staff"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <StaffLayout />
            </CheckAuth>
          }
        >
          <Route path="home" element={<StaffHome />} />
          <Route path="table" element={<StaffTable />} />
          <Route path="menu" element={<StaffMenu />} />
          <Route path="customer" element={<CustomerInfo />} />
          <Route path="bills" element={<StaffBill />} />
          <Route path="pay-bill" element={<StaffPayBill />} />
          <Route path="notifications" element={<StaffNotifications />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
