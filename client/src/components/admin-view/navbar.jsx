import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiMenu3Fill } from "react-icons/ri";
import { Button } from "../ui/button";
import { FaLeaf } from "react-icons/fa";
import { SlLogout } from "react-icons/sl";

import { IoNotifications } from "react-icons/io5";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { logoutUser } from "@/store/auth-slice/auth";

const AdminNavbar = ({ setOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  function handleLogout() {
    dispatch(logoutUser());
  }

  return (
    <header className="flex items-center bg-white justify-between px-4 py-3  border-b">
      {/* Logo */}
      <div className="text-primary1 flex items-center gap-2">
        <FaLeaf size={24} />
        <span>Ordarly</span>
      </div>

      {/* Menu Button (Visible only on small screens) */}
      <div className="text-primary1 lg:hidden flex items-center gap-3">
        <IoNotifications size={24} className="text-primary1 cursor-pointer" />
        
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
        <Button
          onClick={() => setOpen(true)}
          className=" bg-primary1 text-white"
        >
          <RiMenu3Fill size={24} />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      {/* Notification & Avatar */}
      <div className=" hidden lg:flex items-center gap-4 sm:ml-auto">
        <IoNotifications size={24} className="text-primary1 cursor-pointer" />

        <DropdownMenu  >
          <DropdownMenuTrigger asChild>
            <Avatar className="w-8 h-8 flex items-center   cursor-pointer justify-center">
              <AvatarFallback className="bg-primary1 text-white "   >
                {user?.userName ? user.userName[0].toUpperCase() : ""}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" className="w-56">
            <DropdownMenuLabel className="flex items-center text-primary1 justify-center">
              {user?.userName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator   />
            <DropdownMenuItem onClick={handleLogout}>
              <SlLogout className="w-4 h-4 mr-2   " />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminNavbar;
