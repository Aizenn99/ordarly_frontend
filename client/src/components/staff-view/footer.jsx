import { FileText, Home, Settings } from 'lucide-react';
import React from 'react';
import { MdOutlineNoFood, MdTableRestaurant } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const StaffFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const StaffFooterMenuItems = [
    {
      id: "Home",
      label: "Home",
      path: "/staff/home",
      icon: <Home size={26} />,
    },
    {
      id: "Table",
      label: "Table",
      path: "/staff/table",
      icon: <MdTableRestaurant size={26} />,
    },
    {
      id: "Menu",
      label: "Menu",
      path: "/staff/Menu",
      icon: <MdOutlineNoFood size={26} />,
    },
    {
      id: "Bills",
      label: "Bills",
      path: "/staff/bills",
      icon: <FileText size={26} />,
    },
    {
      id: "Settings",
      label: "Settings",
      path: "/staff/settings",
      icon: <Settings size={26} />,
    },
  ];

  return (
    <div className="flex justify-around bg-white p-5  shadow-md">
      {StaffFooterMenuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <motion.div
            key={item.id}
            onClick={() => navigate(item.path)}
            initial={{ y: 0 }}
            animate={{ y: isActive ? -12 : 0 }} // moved more upward
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex cursor-pointer flex-col items-center gap-1 text-xs ${
              isActive ? "text-primary1" : "text-gray-500 hover:text-black"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StaffFooter;
