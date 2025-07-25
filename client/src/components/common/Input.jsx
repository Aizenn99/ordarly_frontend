import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, placeholder, onChange, label, type, name }) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <div>
      {label && (
        <label htmlFor={name} className="text-[13px] text-white">
          {label}
        </label>
      )}
      <div className="input-box flex items-center border border-gray-300 rounded-lg mt-2 mb-2 p-2">
        <input
          id={name}
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          className="w-full bg-transparent text-white outline-none"
          value={value}
          onChange={(e) => onChange(e)}
          name={name}
          aria-label={placeholder}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="ml-2 text-white focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaRegEye size={22} /> : <FaRegEyeSlash size={22} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
