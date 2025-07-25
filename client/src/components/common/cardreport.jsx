const InfoCardReport = ({ icon, iconBg, iconText, value, label, text }) => {
  return (
    <div className="flex gap-6 bg-white rounded-xl p-5 shadow-md shadow-gray-100 border border-gray-400/50">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${iconBg} ${iconText} text-[26px] drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-sm text-gray-700 mb-1">{label}</h6>
        <span className={`text-[21px] ${text}`}>{value}</span>
      </div>
    </div>
  );
};
export default InfoCardReport;