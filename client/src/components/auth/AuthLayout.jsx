import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full ">
      <div className="hidden lg:flex items-center justify-center bg-primary1 w-1/2  ">
        <img src="/loginlg.png" className="w-screen h-screen object-cover " alt="Ordarly Image" />
      </div>
      <div className="flex flex-1 items-center justify-center  px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
