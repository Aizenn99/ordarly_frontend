import React, { useEffect, useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { SlLogout } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice/auth";
import { useNavigate } from "react-router-dom";

const StaffNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Initial load
    const stored = localStorage.getItem("staff_notifications");
    setNotificationCount(stored ? JSON.parse(stored).length : 0);

    // Poll for changes every 2 seconds (or use socket/context in future)
    const interval = setInterval(() => {
      const stored = localStorage.getItem("staff_notifications");
      setNotificationCount(stored ? JSON.parse(stored).length : 0);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <div className="text-primary1 flex items-center gap-2">
        <FaLeaf size={24} />
        <span>Ordarly</span>
      </div>

      <div className="text-primary1 flex items-center gap-3">
        {/* 🔔 Notification with live count */}
        <div  onClick={() => navigate("/staff/notifications")} className="relative">
          <IoNotifications
           
            size={24}
            className="text-primary1 cursor-pointer"
          />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {notificationCount}
            </span>
          )}
        </div>

        {/* 🧑‍ Staff User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-8 h-8 flex items-center cursor-pointer justify-center">
              <AvatarFallback>
                {user?.userName ? user.userName[0].toUpperCase() : ""}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" className="w-56">
            <DropdownMenuLabel className="flex items-center justify-center">
              {user?.userName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <SlLogout className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default StaffNavbar;
