import React from "react";
import {
  MdDashboard,
  MdOutlineNoFood,
  MdTableRestaurant,
} from "react-icons/md";
import { IoReorderThree } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { LuPanelRight } from "react-icons/lu";

import {
  Home,
  FileText,
  ShoppingCart,
  Settings,
  Users,
  HelpCircle,
} from "lucide-react";

const AdminSideBarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <MdDashboard size={18} />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <IoReorderThree size={18} />,
  },
  {
    id: "menu",
    label: "Menu",
    path: "/admin/menu",
    icon: <MdOutlineNoFood size={18} />,
  },
  {
    id: "table-and-qr",
    label: "Table & QR",
    path: "/admin/table-qr",
    icon: <MdTableRestaurant size={18} />,
  },
  {
    id: "bills",
    label: "Bills",
    path: "/admin/bills",
    icon: <FileText size={18} />,
  },
  {
    id: "reports",
    label: "Reports",
    path: "/admin/reports",
    icon: <TbReportSearch size={18} />,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: <Settings size={18} />,
  },
  {
    id: "user-access",
    label: "User & Access",
    path: "/admin/user-access",
    icon: <Users size={18} />,
  },
  {
    id: "update-help",
    label: "Update & Help",
    path: "/admin/update-help",
    icon: <HelpCircle size={18} />,
  },
];

function MenuItems({ setopen }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  return (
    <nav className="mt-8 flex flex-col gap-2">
      {AdminSideBarMenuItems.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            navigate(item.path);
            setopen && setopen(false);
          }}
          className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm ${
            location.pathname === item.path
              ? "bg-[#005C3C] text-white"
              : "text-gray-500 hover:text-black"
          }`}
        >
          {item.icon} <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}

const AdminSideBar = ({ open, setopen }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Sidebar for small screens */}
      <Sheet open={open} onOpenChange={setopen}>
        <SheetContent className="w-64" side="left">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b">
              <SheetTitle className="flex gap-2 mb-6">
                <span>Admin Panel</span>
              </SheetTitle>
            </SheetHeader>
            <MenuItems setopen={setopen} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Sidebar for large screens */}
      <aside className="hidden w-64 flex-col border-r bg-white lg:flex p-6">
        <div className="flex items-center gap-2">
          <h1
            onClick={() => navigate("/admin/dashboard")}
            className="text-xl text-primary1 font-semibold gap-2 flex tracking-tighter cursor-pointer"
          >
            <LuPanelRight size={24} /> {/* Icon for the sidebar */}
            Admin Panel
          </h1>
        </div>
        <MenuItems />
      </aside>
    </>
  );
};

export default AdminSideBar;
