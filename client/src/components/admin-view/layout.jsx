import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminNavbar from "./navbar";

const AdminLayout = () => {
  const [openSideBar, setOpenSideBar] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar fixed */}
      <div className="sticky top-0 h-screen z-20">
        <AdminSideBar open={openSideBar} setopen={setOpenSideBar} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Navbar sticky */}
        <div className="sticky top-0 z-10">
          <AdminNavbar setOpen={setOpenSideBar} />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
