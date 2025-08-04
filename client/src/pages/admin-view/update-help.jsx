import { FaPhoneAlt, FaBell, FaUserCircle } from "react-icons/fa";
import React from "react";

export default function AdminUpdate() {
  return (
    <div className="flex flex-col min-h-screen bg-[#E3F4F4] text-black rounded-lg px-4 py-6 sm:px-6 md:px-10">
      {/* Main Content */}
      <main className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Updates Section */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
              Updates
            </h2>
            <p className="font-semibold text-base sm:text-lg">
              Software is Updated
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Last updated on 28 March 2025
            </p>
            <div className="bg-gray-200 p-4 tracking-tight sm:p-6 rounded-lg text-left text-sm sm:text-base font-semibold space-y-2">
              <p>1. Improved performance and speed</p>
              <p>2. New user interface design</p>
              <p>3. Added new features and functionalities</p>
              <p>4. Compatibility with latest devices and browsers</p>
              <p>5. Bug fixes and stability improvements</p>
              <p>6. Optimized resource usage</p>
              <p>7. Improved user experience</p>
              <p>8. Enhanced accessibility features</p>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-xl tracking-normal shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">
              Help
            </h2>
            <p className="text-base sm:text-lg mb-6 font-semibold">
              For any technical error
            </p>
            <div className="mt-4 space-y-3 text-sm  p-4 rounded-lg sm:text-base">
              <p className="font-semibold">
                <span className="font-semibold">Customer Care:</span> +91 9876543210
              </p>

              <p className="font-semibold">
                <span className="font-semibold">Website:</span>{" "}
                <a href="https://www.ordarly.com" className="text-blue-600 break-all">
                  www.ordarly.com
                </a>
              </p>

              <p className="font-semibold">
                <span className="font-semibold">Email:</span>{" "}
                <span className="break-all">help@ordarly.com</span>
              </p>

              <p className="font-semibold">
                <span className="font-semibold">Address:</span>{" "}
                Incubation center, B-block, Sanjay Ghodawat University, Kolhapur – 416 118
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
