import Input from "@/components/common/Input";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/store/auth-slice/auth";
import { UserIcon } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

const AuthLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  function onChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function onSubmit(e) {
    e.preventDefault(); // ✅ Prevents page refresh

    dispatch(loginUser(formData))
      .unwrap() // ✅ Extracts the raw response data from createAsyncThunk
      .then((data) => {
        toast.success(data?.message || "Logged in successfully");
      })
      .catch((error) => {
        console.error("Login error:", error);

        // ✅ Extracts message from backend error response
        const errorMessage =
          error?.response?.data?.message || error?.message || "Login failed";

        toast.error(errorMessage);
      });
  }

  return (
    <div className="card-login  flex flex-col items-center justify-center ">
      <div className="text-center  ">
        <h1 className="text-white mb-2 flex items-center justify-center">
          <UserIcon className="mr-2  " /> User Sign In
        </h1>
      </div>
      <form onSubmit={onSubmit}>
        <Input
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="het@example.com"
          type="text"
        />
        <Input
          name="password"
          value={formData.password}
          onChange={onChange}
          placeholder="Password"
          type="password"
        />

        <Button type="submit" className="btn  mt-4">
          Login
        </Button>
      </form>
    </div>
  );
};

export default AuthLogin;
