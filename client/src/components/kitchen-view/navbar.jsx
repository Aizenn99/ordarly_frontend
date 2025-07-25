import { logoutUser } from "@/store/auth-slice/auth";
import React from "react";
import { FaLeaf } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { SlLogout } from "react-icons/sl";

const KitchenNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const disptach = useDispatch();

  function handleLogout() {
    disptach(logoutUser());
  }

  return (
    <header className="flex items-center justify-between px-4 py-3  bg-background border-b ">
      <div className="text-primary1 flex items-center gap-2">
        <FaLeaf size={24} />
        <span>Ordarly</span>
      </div>
      <div className="text-primary1 flex items-center gap-3">
        <IoNotifications size={24} className="text-primary1 cursor-pointer" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-8  h-8 flex items-center cursor-pointer justify-center">
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
              <SlLogout className="mr-2 w-4 h-4 " />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default KitchenNavbar;
