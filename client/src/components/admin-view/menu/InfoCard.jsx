import React from "react";

const InfoCard = ({ icon, color, value, label }) => {
  return (
    <div className="flex gap-6 bg-white rounded-2xl p-6 shadow-md shdow-gray-100 border border-gray-200/50">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${color} text-[26px]  text-white drop-shadow-xl `}
      >
        {icon}
      </div>
      <div>
      <h6 className="text-sm text-gray-700 mb-1" >{label}</h6>
      <span className="text-[21px]" >{value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
