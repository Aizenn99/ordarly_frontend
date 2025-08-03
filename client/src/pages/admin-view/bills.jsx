"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBillsAdmin, markBillAsPaid } from "@/store/staff-slice/Bill";
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
import { FcGoogle } from "react-icons/fc";
import { BsCash, BsFillUsbDriveFill } from "react-icons/bs";
import { FaUsb, FaWhatsapp } from "react-icons/fa";
import { TiPrinter } from "react-icons/ti";
import { jsPDF } from "jspdf"; // ✅ PDF generator
import { fetchReceiptSettings } from "@/store/admin-slice/receipt-slice";

const socket = io(`${import.meta.env.VITE_API_URL}`);

const AdminBills = () => {
  const dispatch = useDispatch();
  const { bills } = useSelector((state) => state.staffBill);

  const [filteredBills, setFilteredBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(""); // ✅ input phone number

  const [dateFilter, setDateFilter] = useState(
    localStorage.getItem("billDateFilter") || "today"
  );

  const [customRange, setCustomRange] = useState(() => {
    const storedRange = localStorage.getItem("billCustomRange");
    return storedRange ? JSON.parse(storedRange) : { from: null, to: null };
  });

  const { data, isLoading, error } = useSelector(
    (state) => state.receiptSettings
  );

  useEffect(() => {
    dispatch(fetchReceiptSettings());
  }, [dispatch]);

  const { header, address, businessNumber, footer } = data;

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

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleMarkAsPaid = () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!selectedBill) {
      toast.error("No bill selected");
      return;
    }

    setLoading(true);
    dispatch(
      markBillAsPaid({ billNumber: selectedBill.billNumber, paymentMethod })
    )
      .unwrap()
      .catch((err) => {
        toast.error(err?.message || "Could not mark bill as paid ❌");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSendWhatsApp = async () => {
    if (!selectedBill) {
      toast.error("No bill selected");
      return;
    }
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("ORDARLY", 105, 10, { align: "center" });
      doc.setFontSize(10);

      doc.text(`Bill #: ${selectedBill.billNumber}`, 10, 20);
      doc.text(`Table: ${selectedBill.tableName || "-"}`, 10, 26);
      doc.text(`Guests: ${selectedBill.guestCount || "-"}`, 10, 32);
      doc.text(
        `Date: ${new Date(
          selectedBill.createdAt
        ).toLocaleDateString()} ${new Date(
          selectedBill.createdAt
        ).toLocaleTimeString()}`,
        10,
        38
      );

      let y = 50;
      selectedBill.items.forEach((item) => {
        doc.text(
          `${item.itemName} x${item.quantity} - ₹${item.totalPrice}`,
          10,
          y
        );
        y += 8;
      });

      y += 6;
      doc.text(
        `Subtotal: ₹${selectedBill.subtotal?.toFixed(2) || "0.00"}`,
        10,
        y
      );
      y += 8;
      doc.text(`Grand Total: ₹${selectedBill.totalAmount.toFixed(2)}`, 10, y);

      const pdfBlob = doc.output("blob");
      const formData = new FormData();
      formData.append("file", pdfBlob, `bill-${selectedBill.billNumber}.pdf`);
      formData.append("phoneNumber", phoneNumber);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/send-whatsapp`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success("Bill sent via WhatsApp ✅");
      } else {
        toast.error("Failed to send via WhatsApp ❌");
      }
    } catch (err) {
      toast.error("Error generating PDF ❌");
    }
  };

  // Browser thermal print with all details (aligned like screenshot)

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

  const handleThermalBrowserPrint = () => {
    if (!selectedBill) {
      toast.error("No bill selected");
      return;
    }

    const printWindow = window.open("", "_blank");
    const billHtml = `
    <html>
      <head>
        <title>Bill #${selectedBill.billNumber}</title>
        <style>
          body {
            font-family: monospace;
            font-size: 12px;
            width: 76mm;
            margin: 0;
            padding: 5px;
          }
          h2 { text-align: center; font-size: 16px; margin: 5px 0; font-weight: bold; }
          p { margin: 2px 0; text-align: center; }
          hr { border-top: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td, th { font-size: 12px; padding: 2px 0; }
          th { border-bottom: 1px solid #000; }
          .left { text-align: left; }
          .center { text-align: center; }
          .right { text-align: right; }
          .totals { margin-top: 5px; }
          .totals div { display: flex; justify-content: space-between; }
          .grand {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 13px;
            margin-top: 8px;
            border-top: 1px solid #000;
            padding-top: 4px;
          }
          .neg { color: red; }
          .pos { color: green; }
        </style>
      </head>
      <body>
        <h2>${header || "ORDARLY"}</h2>
        <p>${address || "123 Main Street, City, State, ZIP"}</p>
        <p>${businessNumber || "123-456-7890"}</p>
        <p>www.ordarly.com</p>
        <p>+91 8459278930</p>
        <hr/>
        <div style="display:flex; justify-content:space-between; font-size:12px;">
          <div>
            <p><strong>Bill #${selectedBill.billNumber}</strong></p>
            <p>Table: ${selectedBill.tableName || "-"}</p>
          </div>
          <div style="text-align:right;">
            <p>Date: ${new Date(
              selectedBill.createdAt
            ).toLocaleDateString()}</p>
            <p>Time: ${new Date(
              selectedBill.createdAt
            ).toLocaleTimeString()}</p>
          </div>
        </div>
        <hr/>
        <table>
          <thead>
            <tr>
              <th class="left">Name</th>
              <th class="center">Price</th>
              <th class="center">Qty</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedBill.items
              .map(
                (item) => `
                <tr>
                  <td class="left">${item.itemName}</td>
                  <td class="center">₹${item.unitPrice}</td>
                  <td class="center">${item.quantity}</td>
                  <td class="right">₹${item.totalPrice}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <hr/>
        <div class="totals">
          <div><span>Subtotal</span><span>₹${
            selectedBill.subtotal?.toFixed(2) || "0.00"
          }</span></div>
          ${
            selectedBill.discount > 0
              ? `<div><span>Discount</span><span class="neg">-₹${selectedBill.discount.toFixed(
                  2
                )}</span></div>`
              : ""
          }
          ${selectedBill.taxBreakdown
            .map(
              (tax) => `
            <div><span>${tax.name} (${tax.value}${
                tax.unit === "PERCENTAGE" ? "%" : "₹"
              })</span>
            <span>₹${tax.amount.toFixed(2)}</span></div>
          `
            )
            .join("")}
          ${
            selectedBill.serviceCharge > 0
              ? `<div><span>Service Charge</span><span>₹${selectedBill.serviceCharge.toFixed(
                  2
                )}</span></div>`
              : ""
          }
          ${
            selectedBill.deliveryFee > 0
              ? `<div><span>Delivery Fee</span><span>₹${selectedBill.deliveryFee.toFixed(
                  2
                )}</span></div>`
              : ""
          }
          ${
            selectedBill.packagingFee > 0
              ? `<div><span>Packaging Fee</span><span>₹${selectedBill.packagingFee.toFixed(
                  2
                )}</span></div>`
              : ""
          }
          ${
            selectedBill.roundOff !== 0
              ? `<div><span>Round Off</span><span>${
                  selectedBill.roundOff > 0 ? "+" : "-"
                }₹${Math.abs(selectedBill.roundOff).toFixed(2)}</span></div>`
              : ""
          }
        </div>
        <div class="grand">
          <span>Grand Total</span>
          <span>₹${selectedBill.totalAmount.toFixed(2)}</span>
        </div>
        <hr/>
        <p>${footer || "Thank you,Visit again!"}</p>
      </body>
    </html>
  `;
    printWindow.document.write(billHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Direct ESC/POS via backend
  const handleDirectPrint = async () => {
    if (!selectedBill) {
      toast.error("No bill selected");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bill: selectedBill }),
      });
      if (res.ok) {
        toast.success("Bill sent to thermal printer ✅");
      } else {
        toast.error("Printer error ❌");
      }
    } catch (err) {
      toast.error("Could not connect to printer ❌");
    }
  };

  useEffect(() => {
    localStorage.setItem("billDateFilter", dateFilter);
  }, [dateFilter]);

  useEffect(() => {
    localStorage.setItem("billCustomRange", JSON.stringify(customRange));
  }, [customRange]);

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
          <Button className="bg-yellow-600 text-white">Generate Excel</Button>
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
              filteredBills.map((bill, index) => (
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
                    className="md:w-[400px] md:pr-2 w-[380px] overflow-y-auto"
                  >
                    <div className="flex justify-center items-center gap-6 mt-6">
                      <Button
                        onClick={handleSendWhatsApp}
                        className="p-3 rounded-lg w-20 h-10 cursor-pointer  bg-green-100 transition-colors"
                        title="Send via WhatsApp"
                      >
                        <FaWhatsapp className="text-green-500 w-12 h-12  " />
                      </Button>

                      <Button
                        onClick={handleThermalBrowserPrint}
                        className="p-3 cursor-pointer rounded-lg w-20 h-10  bg-blue-100 transition-colors"
                        title="Browser Print"
                      >
                        <TiPrinter className="text-blue-500 w-12 h-12  " />
                      </Button>

                      <Button
                        onClick={handleDirectPrint}
                        className="p-3 cursor-pointer rounded-lg w-20 h-10  bg-gray-100 transition-colors"
                        title="Direct Thermal Print"
                      >
                        <FaUsb className="text-gray-600 w-12 h-12  " />
                      </Button>
                    </div>

                    {/* Add spacing before next group */}
                    <div className=" flex justify-center items-center gap-6">
                      <Button
                        variant="destructive"
                        className="rounded-lg w-20 h-10 cursor-pointer "
                      >
                        DELETE
                      </Button>

                      <Button
                        variant="default"
                        className="rounded-lg w-20 h-10 cursor-pointer "
                      >
                        EDIT
                      </Button>

                      <span
                        className={`text-sm font-semibold px-4 py-2 flex items-center justify-center rounded-lg w-20 h-10 ${
                          bill.status === "PAID"
                            ? "bg-green-100 text-primary1"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {bill.status === "PAID" ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="text-center text-sm px-4">
                      <h2 className="text-xl font-bold">
                        {header || "Your Shop Name"}
                      </h2>
                      <p>{address || "123 Main St, Your City"}</p>
                      <p>{businessNumber || "GSTIN0000XXXX"}</p>
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
                            <span>
                              {tax.name} ({tax.value}
                              {tax.unit === "PERCENTAGE" ? "%" : "₹"})
                            </span>
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
                      <p className="text-xs">
                        {footer || "Thanks for visiting!"}
                      </p>
                      {bill.status !== "PAID" && (
                        <div className="mt-4 flex justify-around">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div
                                className="cursor-pointer"
                                onClick={() => setPaymentMethod("CASH")}
                              >
                                <span className="flex items-center bg-gray-100 rounded-lg gap-2 p-3 hover:bg-gray-200">
                                  <BsCash size={20} className="text-primary1" />
                                  <span className=" ">Cash</span>
                                </span>
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-primary1">
                                  Confirm Payment
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark this bill as
                                  paid via <strong>Cash</strong>?
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
                                className=" cursor-pointer"
                                onClick={() => setPaymentMethod("UPI")}
                              >
                                <span className="flex items-center bg-gray-100 rounded-lg gap-2 p-3 hover:bg-gray-200">
                                  <FcGoogle size={20} />
                                  <span className="">UPI / Card</span>
                                </span>
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-primary1">
                                  Confirm Payment
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark this bill as
                                  paid via <strong>UPI / Card</strong>?
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
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              ))
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
