import React, { useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

const StaffBill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bills } = useSelector((state) => state.staffBill);

  useEffect(() => {
    dispatch(getAllBills()).then((res) => {});
  }, [dispatch]);

  const totalBills = bills.length;
  const paidBills = bills.filter(
    (b) => b.status.toLowerCase() === "paid"
  ).length;
  const unpaidBills = bills.filter(
    (b) => b.status.toLowerCase() !== "paid"
  ).length;

  return (
    <div className="p-3 md:p-4 mt-1">
      <div className="flex justify-end items-end mb-4">
        <span>
          <CurrentDate />
        </span>
      </div>

      {/* Bill summary cards */}
      <div className="w-full p-2 gap-8 mb-4 grid grid-cols-3">
        <div className="text-sm p-4 min-h-[120px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-yellow-600 bg-beige text-center whitespace-normal break-words">
          <h1>Total Bills</h1>
          <span className="text-xl text-yellow-600 mt-1 font-semibold">
            {totalBills}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[120px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-primary1 bg-green-200 text-center whitespace-normal break-words">
          <h1>Paid Bills</h1>
          <span className="text-xl mt-1 text-primary1 font-semibold">
            {paidBills}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[120px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-red-600 bg-red-200 text-center whitespace-normal break-words">
          <h1>Unpaid Bills</h1>
          <span className="text-xl mt-1 text-red-600 font-semibold">
            {unpaidBills}
          </span>
        </div>
      </div>

      {/* Map all fetched bills */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map((bill, index) => {
          const isPaid = bill.status.toLowerCase() === "paid";
          return (
            <div
              key={index}
              className="bg-white mb-4 rounded-2xl px-4 py-3 shadow-md border"
            >
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

                      {/* {isPaid && (
                        <div className="flex justify-center mt-4">
                         
                          <Button
                            onClick={() =>
                              navigate("/staff/menu", {
                                state: {
                                  billNumber: bill.billNumber,
                                  tableName: bill.tableName,
                                  guestCount: bill.guestCount,
                                  spaceName: bill.spaceName,
                                  items: bill.items,
                                },
                              })
                            }
                            className="bg-primary1 text-white hover:bg-green-800"
                          >
                            Edit Items
                          </Button>
                        </div>
                      )} */}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Show edit button outside only for paid bills */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffBill;
