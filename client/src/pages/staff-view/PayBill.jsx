import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BsCash } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { markBillAsPaid } from "@/store/staff-slice/Bill";
import toast from "react-hot-toast";

const StaffPayBill = () => {
  const { state: bill } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  // 🚨 Guard for missing bill
  if (!bill) {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        Invalid or missing bill data. Please go back to bills list.
      </div>
    );
  }

  const isPaid = bill.status.toLowerCase() === "paid";

  const handleMarkAsPaid = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setLoading(true);
    dispatch(markBillAsPaid({ billNumber: bill.billNumber, paymentMethod }))
      .unwrap()
      .then(() => {
        toast.success(`Bill #${bill.billNumber} marked as paid ✅`);
        navigate("/staff/bills");
      })
      .catch((err) => {
        toast.error(err?.message || "Could not mark bill as paid ❌");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="p-3 md:p-5 bg-[#E3F4F4] min-h-screen">
      {/* Order Summary */}
      <div className="flex p-4 items-center justify-between mb-4 bg-white rounded-2xl shadow-md">
        <div>
          <p className="font-semibold">Order Summary</p>
          <p className="text-sm text-gray-500">
            Created:{" "}
            {(() => {
              const date = new Date(bill.createdAt);
              const day = String(date.getDate()).padStart(2, "0");
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            })()}{" "}
            {new Date(bill.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <span className="text-lg font-semibold text-black">
          ₹{bill.totalAmount}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="font-semibold text-md">Bill #{bill.billNumber}</h2>
            <p className="text-sm text-black">
              Table {bill.tableName} • {bill.guestCount} guests
            </p>
          </div>
          <p
            className={`text-xl font-semibold ${
              isPaid ? "text-primary1" : "text-red-600"
            }`}
          >
            ₹{bill.totalAmount}
          </p>
        </div>

        <div className="mt-6 overflow-y-auto max-h-[500px]">
          {bill.items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] text-gray-600 text-sm mb-2"
            >
              <span className="text-xs w-full truncate">
                {i + 1}. {item.itemName}
              </span>
              <span className="text-center">{item.quantity}</span>
              <span className="text-center">₹{item.unitPrice}</span>
              <span className="text-right font-medium">
                ₹{item.totalPrice}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-10 mb-4">
          <p className="text-sm text-gray-600">
            Created: {new Date(bill.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-sm font-medium">
            Status:{" "}
            <span className={isPaid ? "text-primary1" : "text-red-600"}>
              {bill.status.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Payment Options */}
      <div className="p-4 mt-8 bg-white rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-primary1 mb-2">PAY USING</h2>

        {/* CASH */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div
              className="cursor-pointer"
              onClick={() => setPaymentMethod("CASH")}
            >
              <span className="flex items-center bg-gray-100 rounded-lg gap-2 p-3 hover:bg-gray-200">
                <BsCash size={24} className="text-primary1" />
                <span className="text-lg font-semibold">Cash</span>
              </span>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary1">
                Confirm Payment
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this bill as paid via{" "}
                <strong>Cash</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary1"
                onClick={handleMarkAsPaid}
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Pay"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* UPI / CARD */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div
              className="mt-2 cursor-pointer"
              onClick={() => setPaymentMethod("UPI")}
            >
              <span className="flex items-center bg-gray-100 rounded-lg gap-2 p-3 hover:bg-gray-200">
                <FcGoogle size={24} />
                <span className="text-lg font-semibold">UPI / Card</span>
              </span>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary1">
                Confirm Payment
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this bill as paid via{" "}
                <strong>UPI / Card</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary1"
                onClick={handleMarkAsPaid}
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Pay"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default StaffPayBill;
