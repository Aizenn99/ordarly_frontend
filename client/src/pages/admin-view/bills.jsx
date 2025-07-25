"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBillsAdmin } from "@/store/staff-slice/Bill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { subDays, isSameDay, isWithinInterval } from "date-fns";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import io from "socket.io-client";
import { toast } from "react-hot-toast";

const socket = io(`${import.meta.env.VITE_API_URL}`);

const AdminBills = () => {
  const dispatch = useDispatch();
  const { bills } = useSelector((state) => state.staffBill);

  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [dateFilter, setDateFilter] = useState(
    localStorage.getItem("billDateFilter") || "today"
  );

  const [customRange, setCustomRange] = useState(() => {
    const storedRange = localStorage.getItem("billCustomRange");
    return storedRange ? JSON.parse(storedRange) : { from: null, to: null };
  });

  useEffect(() => {
    dispatch(getAllBillsAdmin());
  }, [dispatch]);

  useEffect(() => {
    socket.on("new-bill", () => {
      dispatch(getAllBillsAdmin());
    });

    socket.on("bill-paid", (updatedBill) => {
      dispatch(getAllBillsAdmin());
      toast.success(`Bill #${updatedBill.billNumber} marked as PAID ✅`);
    });

    return () => {
      socket.off("new-bill");
      socket.off("bill-paid");
    };
  }, [dispatch]);

  useEffect(() => {
    if (!bills) return;
    const today = new Date();
    let filtered = [];

    switch (dateFilter) {
      case "today":
        filtered = bills.filter((bill) =>
          isSameDay(new Date(bill.createdAt), today)
        );
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        filtered = bills.filter((bill) =>
          isSameDay(new Date(bill.createdAt), yesterday)
        );
        break;
      case "last7":
        filtered = bills.filter((bill) =>
          isWithinInterval(new Date(bill.createdAt), {
            start: subDays(today, 6),
            end: today,
          })
        );
        break;
      case "last30":
        filtered = bills.filter((bill) =>
          isWithinInterval(new Date(bill.createdAt), {
            start: subDays(today, 29),
            end: today,
          })
        );
        break;
      case "custom":
        if (customRange.from && customRange.to) {
          filtered = bills.filter((bill) =>
            isWithinInterval(new Date(bill.createdAt), {
              start: customRange.from,
              end: customRange.to,
            })
          );
        }
        break;
      default:
        filtered = bills;
    }

    setFilteredBills(filtered);
  }, [bills, dateFilter, customRange]);

  useEffect(() => {
    localStorage.setItem("billDateFilter", dateFilter);
  }, [dateFilter]);

  useEffect(() => {
    localStorage.setItem("billCustomRange", JSON.stringify(customRange));
  }, [customRange]);

  const handleExcelDownload = () => {
    alert("Excel generation logic goes here");
  };

  return (
    <div className="p-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="hidden sm:flex flex-wrap gap-2">
            {["today", "yesterday", "last 7 Days", "last 30 Days"].map(
              (value) => (
                <Button
                  key={value}
                  variant={dateFilter === value ? "default" : "outline"}
                  onClick={() => setDateFilter(value)}
                >
                  {value.charAt(0).toUpperCase() +
                    value
                      .slice(1)
                      .replace("last", "Last ")
                      .replace("today", "Today")
                      .replace("yesterday", "Yesterday")}
                </Button>
              )
            )}
            <CalendarDateRangePicker
              onUpdate={(range) => {
                setCustomRange(range);
                setDateFilter("custom");
              }}
              dateRange={customRange}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            className="bg-yellow-600 text-white"
            onClick={handleExcelDownload}
          >
            Generate Excel
          </Button>
          <div className="sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="space-y-3 mt-5 p-4">
                  {["today", "yesterday", "last7", "last30"].map((value) => (
                    <Button
                      key={value}
                      className="w-full"
                      variant={dateFilter === value ? "default" : "outline"}
                      onClick={() => setDateFilter(value)}
                    >
                      {value.charAt(0).toUpperCase() +
                        value
                          .slice(1)
                          .replace("last", "Last ")
                          .replace("today", "Today")
                          .replace("yesterday", "Yesterday")}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-[360px] sm:w-full rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.length > 0 ? (
              filteredBills.map((bill, index) => {
                const taxSettings =
                  bill.settings?.filter((s) => s.type === "TAX") || [];

                return (
                  <Sheet
                    key={bill._id}
                    open={sheetOpen && selectedBill?._id === bill._id}
                    onOpenChange={setSheetOpen}
                  >
                    <SheetTrigger asChild>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{bill.spaceName || "-"}</TableCell>
                        <TableCell>{bill.tableName || "-"}</TableCell>
                        <TableCell>{bill.guestCount || "-"}</TableCell>
                        <TableCell>{bill.totalAmount}</TableCell>
                        <TableCell
                          className={
                            bill.status === "PAID"
                              ? "text-green-600"
                              : "text-red-500"
                          }
                        >
                          {bill.status}
                        </TableCell>
                      </TableRow>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-[370px] sm:w-[420px]"
                    >
                      <div className="flex justify-around p-3 pt-10 items-center">
                        <Button
                          variant="destructive"
                          className="rounded-2xl w-25"
                        >
                          DELETE
                        </Button>
                        <Button variant="default" className="rounded-2xl w-25">
                          EDIT
                        </Button>
                        <span
                          className={`text-xs font-semibold px-2 py-1 w-25 h-9.5 flex items-center justify-center rounded-full ${
                            bill.status === "PAID"
                              ? "bg-green-100 text-primary1 border border-primary1"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                        >
                          {bill.status === "PAID" ? "Paid" : "Unpaid"}
                        </span>
                      </div>

                      <div className="text-center text-sm px-4">
                        <h2 className="text-xl font-bold">ORDARLY</h2>
                        <p>Sanjay Ghodawat University</p>
                        <p>23SCIA50014</p>
                        <p>www.ordarly.com</p>
                        <p>+91 8459278930</p>
                        <hr className="my-2" />
                        <div className="flex justify-between text-left text-xs">
                          <div>
                            <p>
                              <strong>Bill #{bill.billNumber}</strong>
                            </p>
                            <p>Table: {bill.tableName}</p>
                          </div>
                          <div>
                            <p>
                              Date:{" "}
                              {new Date(bill.createdAt).toLocaleDateString()}
                            </p>
                            <p>
                              Time:{" "}
                              {new Date(bill.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <hr className="my-2" />
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th align="left">Name</th>
                              <th>Price</th>
                              <th>Qty</th>
                              <th align="right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bill.items.map((item, i) => (
                              <tr key={i}>
                                <td align="left">{item.itemName}</td>
                                <td>₹{item.unitPrice}</td>
                                <td>{item.quantity}</td>
                                <td align="right">₹{item.totalPrice}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <hr className="my-2" />
                        <div className="text-xs space-y-1 px-2">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{bill.subtotal?.toFixed(2)}</span>
                          </div>

                          {bill.discount > 0 && (
                            <div className="flex justify-between">
                              <span>Discount</span>
                              <span className="text-red-500">
                                -₹{bill.discount.toFixed(2)}
                              </span>
                            </div>
                          )}

                        {bill.taxBreakdown.map((tax, idx) => (
  <div key={idx} className="flex justify-between">
    <span>{tax.name} ({tax.value}{tax.unit === "PERCENTAGE" ? "%" : "₹"})</span>
    <span>₹{tax.amount.toFixed(2)}</span>
  </div>
))}


                          {bill.serviceCharge > 0 && (
                            <div className="flex justify-between">
                              <span>Service Charge</span>
                              <span>₹{bill.serviceCharge.toFixed(2)}</span>
                            </div>
                          )}

                          {bill.deliveryFee > 0 && (
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>₹{bill.deliveryFee.toFixed(2)}</span>
                            </div>
                          )}

                          {bill.packagingFee > 0 && (
                            <div className="flex justify-between">
                              <span>Packaging Fee</span>
                              <span>₹{bill.packagingFee.toFixed(2)}</span>
                            </div>
                          )}

                          {bill.roundOff !== 0 && (
                            <div className="flex justify-between">
                              <span>Round Off</span>
                              <span>
                                {bill.roundOff > 0
                                  ? `+₹${bill.roundOff.toFixed(2)}`
                                  : `-₹${Math.abs(bill.roundOff).toFixed(2)}`}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between font-semibold text-sm mt-2 pt-2 border-t">
                            <span>Grand Total</span>
                            <span>₹{bill.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>{" "}
                        <hr className="my-2" />
                        <p className="text-xs">Thank you. Visit Again.</p>
                        {bill.status !== "PAID" && (
                          <div className="mt-4 flex justify-around">
                            <Button
                              variant="outline"
                              className="text-green-600 border-green-500"
                            >
                              💵 CASH
                            </Button>
                            <Button
                              variant="outline"
                              className="text-blue-600 border-blue-500"
                            >
                              💳 UPI / CARD
                            </Button>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No bills found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBills;
