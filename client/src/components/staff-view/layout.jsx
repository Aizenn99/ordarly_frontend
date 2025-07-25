import React from "react";
import { Outlet } from "react-router-dom";
import StaffNavbar from "./navbar";
import StaffFooter from "./footer";

const StaffLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <StaffNavbar />
      </div>

      {/* Main Content with padding to avoid overlapping the fixed footer */}
      <main className="flex-1 p-1 md:p-6 pb-20 overflow-y-auto scrollbar-hide ">
        <Outlet />
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t z-10">
        <StaffFooter />
      </footer>
    </div>
  );
};
export default StaffLayout;
