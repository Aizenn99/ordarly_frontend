// StaffSettings.jsx

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export default function StaffSettings() {
  const { user } = useSelector((state) => state.auth);

  // Initialize toggles from localStorage (default to true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    JSON.parse(localStorage.getItem("notificationsEnabled")) ?? true
  );
  const [orderSoundEnabled, setOrderSoundEnabled] = useState(() =>
    JSON.parse(localStorage.getItem("orderSoundEnabled")) ?? true
  );

  // Persist toggles whenever they change
  useEffect(() => {
    localStorage.setItem(
      "notificationsEnabled",
      JSON.stringify(notificationsEnabled)
    );
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(
      "orderSoundEnabled",
      JSON.stringify(orderSoundEnabled)
    );
  }, [orderSoundEnabled]);

  const username = user?.userName || "John Doe";
  const email = user?.email || "user@example.com";
  const role = user?.role || "staff";

  return (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white text-black p-4 sm:p-6 rounded-2xl shadow-md space-y-6">
      <div className="text-sm flex flex-col sm:flex-row justify-between text-gray-600">
        <span className="mb-1 sm:mb-0">User Profile</span>
        <span>
          Role: <strong className="text-black">{role}</strong>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 items-center text-center sm:text-left">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
          👔
        </div>
        <div className="mt-2 sm:mt-0">
          <p className="font-semibold text-sm">{username}</p>
          <p className="text-gray-500 text-xs break-words max-w-[180px] sm:max-w-none">
            {email}
          </p>
        </div>
      </div>

      {/* Display Name and Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">User Name</label>
          <p className="text-sm text-gray-800">{username}</p>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Email</label>
          <p className="text-sm text-gray-800">{email}</p>
        </div>
      </div>

      {/* App Settings */}
      <div className="pt-4 border-t space-y-4">
        <p className="font-semibold text-md">App settings</p>

        <div className="flex justify-between items-center">
          <span className="text-sm">Notifications</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300"
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm">Order Alerts Sound</span>
          <input
            type="checkbox"
            checked={orderSoundEnabled}
            onChange={(e) => setOrderSoundEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 accent-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
