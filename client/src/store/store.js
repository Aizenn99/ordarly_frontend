import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice/auth";
import AdminmenuItemSlice from "./admin-slice/menuItem";
import AdminTableSlice from "./admin-slice/table";
import StaffCartSlice from "./staff-slice/cart"
import StaffBillSlice from "./staff-slice/Bill";
import kitchenOrderSlice from "./kitchen-slice/order-slice"
import dashboardSlice from "./dashboard-slice/report-slice"
import settingSlice from "./admin-slice/settings";
import receiptSlice from "./admin-slice/receipt-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminMenuItem: AdminmenuItemSlice,
    adminTable: AdminTableSlice,
    staffCart: StaffCartSlice,
    staffBill: StaffBillSlice,
    kitchenOrder : kitchenOrderSlice,
    dashboard: dashboardSlice,
    adminSettings: settingSlice,
    receiptSettings: receiptSlice,
  },
});

export default store;
