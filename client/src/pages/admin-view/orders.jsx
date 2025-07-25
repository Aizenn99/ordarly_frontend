"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKitchenOrders } from "@/store/kitchen-slice/order-slice";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock } from "lucide-react";
import { MdTableRestaurant } from "react-icons/md";
import io from "socket.io-client";

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  transports: ["websocket"],
  withCredentials: true,
});

const AdminOrders = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.kitchenOrder.orders || []);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchKitchenOrders());

    // Listen for real-time KOT ready updates
    socket.on("kot-ready", () => {
      dispatch(fetchKitchenOrders());
    });

    return () => socket.off("kot-ready");
  }, [dispatch]);

  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = dateObj.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${time} | ${date}`;
  };

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-xl font-semibold text-primary1 mb-4">
        Current Orders
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {orders.map((order) => (
          <Dialog key={order.kotNumber}>
            <DialogTrigger asChild>
              <div
                className="cursor-pointer bg-white p-4 rounded-xl shadow-md border border-primary1 hover:shadow-lg transition"
                onClick={() => setSelectedOrder(order)}
              >
                <h2 className="text-base font-semibold tracking-tight">
                  {order.username || "Unknown"}
                </h2>

                <div className="flex items-center mt-2 gap-2 text-sm text-gray-700">
                  <MdTableRestaurant className="w-4 h-4" />
                  Table |{" "}
                  <span className="text-primary1">{order.tableName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                  SpaceName |{" "}
                  <span className="text-primary1">{order.spaceName}</span>
                </div>

                <div className="my-2 border-b  " />

                <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                  <Clock className="w-4 h-4" />
                  {formatDateTime(order.createdAt)}
                </div>

                <div className="mt-6">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      order.status === "ready"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        order.status === "ready"
                          ? "bg-green-600"
                          : "bg-yellow-500"
                      } inline-block`}
                    />
                    {order.status || "New Order"}
                  </span>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg">
                  {order.username || "Staff"} —{" "}
                  <span className="text-primary1">
                    {order.spaceName || "N/A"}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDateTime(order.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MdTableRestaurant className="w-4 h-4" />
                    Table{" "}
                    <span className="text-primary1">{order.tableName}</span>
                  </div>
                </div>

                <div className="mt-3 text-sm font-mono">
                  <div className="grid grid-cols-[2fr_2fr] font-semibold border-b pb-1 mb-1">
                    <span>Item</span>
                    <span className="text-center">Qty</span>
                  </div>

                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[2fr_2fr] items-center"
                      >
                        <span>
                          {index + 1}. {item.itemName}
                        </span>
                        <span className="text-center">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    Created at {formatDateTime(order.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        order.status === "ready"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.status || "New Order"}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
