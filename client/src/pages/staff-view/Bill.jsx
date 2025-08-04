import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBills } from "@/store/staff-slice/Bill";
import CurrentDate from "@/components/staff-view/date";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const CLEARED_KEY = "clearedBills";

const StaffBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills } = useSelector((state) => state.staffBill);

  // UI-only list
  const [visibleBills, setVisibleBills] = useState([]);

  // Load & filter out cleared IDs on mount
  useEffect(() => {
    const stored = localStorage.getItem(CLEARED_KEY);
    const clearedIds = stored ? JSON.parse(stored) : [];

    dispatch(getAllBills()).then((res) => {
      const all = res.payload || [];
      const filtered = all.filter((b) => !clearedIds.includes(b._id));
      setVisibleBills(filtered);
    });
  }, [dispatch]);

  // Keep in sync when Redux bills update
  useEffect(() => {
    const stored = localStorage.getItem(CLEARED_KEY);
    const clearedIds = stored ? JSON.parse(stored) : [];
    setVisibleBills(bills.filter((b) => !clearedIds.includes(b._id)));
  }, [bills]);

  const handleClear = () => {
    // gather current visible IDs
    const toClear = visibleBills.map((b) => b._id);
    if (toClear.length === 0) return;

    // merge with any previously cleared
    const stored = localStorage.getItem(CLEARED_KEY);
    const clearedIds = stored ? JSON.parse(stored) : [];
    const newCleared = Array.from(new Set([...clearedIds, ...toClear]));

    localStorage.setItem(CLEARED_KEY, JSON.stringify(newCleared));
    setVisibleBills([]);
  };

  const totalBills = visibleBills.length;
  const paidBills = visibleBills.filter(
    (b) => b.status.toLowerCase() === "paid"
  ).length;
  const unpaidBills = totalBills - paidBills;

  return (
    <div className="p-3 md:p-4 mt-1">
      {/* Date + Clear Dialog */}
      <div className="flex justify-between items-end mb-4">
        <CurrentDate />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="bg-red-500 text-white hover:bg-red-600">
              Clear Bills
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Bills?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will clear all the bills, Even Unpaid Bills.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Summary Cards */}
      <div className="w-full p-2 gap-8 mb-4 grid grid-cols-3">
        <div className="text-sm p-4 min-h-[120px] flex flex-col items-center justify-center rounded-2xl shadow-md border border-yellow-600 bg-beige text-center">
          <h1>Total Bills</h1>
          <span className="text-xl text-yellow-600 mt-1 font-semibold">
            {totalBills}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[120px] flex flex-col items-center justify-center rounded-2xl shadow-md border border-primary1 bg-green-200 text-center">
          <h1>Paid Bills</h1>
          <span className="text-xl mt-1 text-primary1 font-semibold">
            {paidBills}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[120px] flex flex-col items-center justify-center rounded-2xl shadow-md border border-red-600 bg-red-200 text-center">
          <h1>Unpaid Bills</h1>
          <span className="text-xl mt-1 text-red-600 font-semibold">
            {unpaidBills}
          </span>
        </div>
      </div>

      {/* Bills Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleBills.map((bill, idx) => {
          const isPaid = bill.status.toLowerCase() === "paid";
          return (
            <div
              key={bill._id}
              className="bg-white mb-4 rounded-2xl px-4 py-3 shadow-md border"
            >
              {/* Header */}
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold text-md">
                    Bill #{bill.billNumber}
                  </h2>
                  <p className="text-sm text-black">
                    Table {bill.tableName} • {bill.guestCount} guests
                  </p>
                </div>
                <p
                  className={`text-xl font-semibold self-center ${
                    isPaid ? "text-primary1" : "text-red-600"
                  }`}
                >
                  ₹{bill.totalAmount}
                </p>
              </div>

              {/* Created / Status */}
              <div className="flex justify-between mt-4">
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

              {/* Items Accordion */}
              <Accordion type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger className="justify-center text-black" />
                  <AccordionContent>
                    <div className="mt-3">
                      {bill.items.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-[2fr_1fr_1fr_1fr] text-gray-600 text-sm mb-2"
                        >
                          <span className="text-xs truncate">
                            {i + 1}. {item.itemName}
                          </span>
                          <span className="text-center">{item.quantity}</span>
                          <span className="text-center">₹{item.unitPrice}</span>
                          <span className="text-right font-medium">
                            ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}

                      {!isPaid && (
                        <div className="flex justify-between items-center mt-6 mx-10 gap-2">
                          <Button
                            onClick={() =>
                              navigate("/staff/menu", { state: bill })
                            }
                            className="w-30 bg-primary1 text-white hover:bg-green-800"
                          >
                            Edit Items
                          </Button>
                          <Button
                            onClick={() =>
                              navigate("/staff/pay-bill", { state: bill })
                            }
                            className="w-30 bg-primary1 text-white hover:bg-green-800"
                          >
                            Pay
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffBill;
