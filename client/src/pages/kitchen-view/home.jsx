import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKitchenOrders,
  updateKOTStatus,
} from "@/store/kitchen-slice/order-slice";
import io from "socket.io-client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import CurrentDate from "@/components/staff-view/date";

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  transports: ["websocket"],
  withCredentials: true,
});

const PREPARED_KEY = "prepared_items_map";
const SENT_KEY = "sent_items_map";

const KitchenHome = () => {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.kitchenOrder);

  const [preparedItemsMap, setPreparedItemsMap] = useState({});
  const [sentItemsMap, setSentItemsMap] = useState({});

  // Load from localStorage
  useEffect(() => {
    const prepared = JSON.parse(localStorage.getItem(PREPARED_KEY) || "{}");
    const sent = JSON.parse(localStorage.getItem(SENT_KEY) || "{}");

    const convert = (obj) => {
      const result = {};
      for (const key in obj) {
        result[key] = new Set(obj[key]);
      }
      return result;
    };

    setPreparedItemsMap(convert(prepared));
    setSentItemsMap(convert(sent));
  }, []);

  useEffect(() => {
    dispatch(fetchKitchenOrders());
    socket.on("new-kot", () => dispatch(fetchKitchenOrders()));
    return () => socket.off("new-kot");
  }, [dispatch]);

  const saveMapToStorage = (map, key) => {
    const serializable = {};
    for (const orderId in map) {
      serializable[orderId] = Array.from(map[orderId]);
    }
    localStorage.setItem(key, JSON.stringify(serializable));
  };

  const handleItemCheck = (orderId, itemIndex, checked) => {
    // Don't allow unchecking already sent items
    if (sentItemsMap[orderId]?.has(itemIndex)) return;

    setPreparedItemsMap((prev) => {
      const current = prev[orderId] || new Set();
      const updated = new Set(current);
      checked ? updated.add(itemIndex) : updated.delete(itemIndex);
      const newMap = { ...prev, [orderId]: updated };
      saveMapToStorage(newMap, PREPARED_KEY);
      return newMap;
    });
  };

  const handleSelectAll = (orderId, totalItems) => {
    const alreadySent = sentItemsMap[orderId] || new Set();
    const all = new Set();
    for (let i = 0; i < totalItems; i++) {
      if (!alreadySent.has(i)) all.add(i);
    }
    setPreparedItemsMap((prev) => {
      const newMap = { ...prev, [orderId]: all };
      saveMapToStorage(newMap, PREPARED_KEY);
      return newMap;
    });
  };

  const handleMarkPrepared = (orderItem) => {
    const orderId = orderItem._id;
    const preparedSet = preparedItemsMap[orderId] || new Set();
    const sentSet = sentItemsMap[orderId] || new Set();

    // Find items that are newly prepared but not yet sent
    const unsentPrepared = [...preparedSet].filter((i) => !sentSet.has(i));
    if (unsentPrepared.length === 0) return;

    const preparedItems = unsentPrepared.map((i) => orderItem.items[i]);
    const payload = {
      kotNumber: orderItem.kotNumber,
      username: orderItem.username,
      tableName: orderItem.tableName,
      spaceName: orderItem.spaceName,
      items: preparedItems,
      message: `Order for table ${orderItem.tableName} is ready.`,
    };

    socket.emit("kot-ready", payload);
    console.log("📤 Sent prepared items:", preparedItems);

    const newSent = new Set(sentSet);
    unsentPrepared.forEach((i) => newSent.add(i));
    const allPrepared = orderItem.items.length === newSent.size;

    // Update local states & storage
    setSentItemsMap((prev) => {
      const updated = { ...prev, [orderId]: newSent };
      saveMapToStorage(updated, SENT_KEY);
      return updated;
    });

    if (allPrepared) {
      dispatch(updateKOTStatus({ kotNumber: orderItem.kotNumber, status: "ready" }));

      setPreparedItemsMap((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        saveMapToStorage(updated, PREPARED_KEY);
        return updated;
      });

      setSentItemsMap((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        saveMapToStorage(updated, SENT_KEY);
        return updated;
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <CurrentDate />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard title="Total Orders" count={orders.length} color="yellow" />
        <SummaryCard
          title="Served"
          count={orders.filter((o) => o.status === "ready").length}
          color="green"
        />
        <SummaryCard
          title="To Be Prepared"
          count={orders.filter((o) => o.status !== "ready").length}
          color="red"
        />
      </div>

      <Accordion type="multiple" className="space-y-4">
        {orders.map((order) => {
          const preparedSet = preparedItemsMap[order._id] || new Set();
          const sentSet = sentItemsMap[order._id] || new Set();

          return (
            <AccordionItem key={order._id} value={order._id}>
              <div className="border rounded-xl p-4 shadow">
                <OrderHeader order={order} />
                <AccordionTrigger className="w-full justify-center mt-1">Show Items</AccordionTrigger>
                <AccordionContent>
                  <div className="py-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Items</p>
                      <button
                        className="text-xs underline"
                        onClick={() => handleSelectAll(order._id, order.items.length)}
                      >
                        Select All
                      </button>
                    </div>

                    {order.items.map((item, index) => {
                      const isPrepared = preparedSet.has(index);
                      const isSent = sentSet.has(index);
                      return (
                        <div
                          key={index}
                          className="flex justify-between text-sm items-center py-1 mb-1"
                        >
                          <span className="w-3/5">
                            {index + 1}.{" "}
                            <span className={isSent ? "line-through text-green-600" : ""}>
                              {item.itemName}
                            </span>
                          </span>
                          <span className="text-center w-1/5">{item.quantity}</span>
                          <Checkbox
                            checked={isPrepared}
                            disabled={isSent}
                            onCheckedChange={(checked) =>
                              handleItemCheck(order._id, index, checked)
                            }
                          />
                        </div>
                      );
                    })}

                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Button className="text-white" onClick={() => handleMarkPrepared(order)}>
                        Mark Prepared
                      </Button>
                      <Button variant="destructive">Delete</Button>
                    </div>
                  </div>
                </AccordionContent>
              </div>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

// 🔧 Small components for clarity
const SummaryCard = ({ title, count, color }) => (
  <div
    className={`bg-${color}-100 border border-${color}-400 rounded-xl text-center py-4 shadow`}
  >
    <p className="font-semibold">{title}</p>
    <p className="text-2xl">{count}</p>
  </div>
);

const OrderHeader = ({ order }) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="font-semibold">Order #{order.kotNumber}</p>
      <p className="text-sm">Staff | {order.username}</p>
      <p className="text-sm">
        Table {order.tableName} • {order.guestCount} guests
      </p>
    </div>
    <div className="text-right">
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          order.status === "ready" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
        }`}
      >
        Status: {order.status.toUpperCase()}
      </span>
      <p className="text-xs text-gray-500 mt-3">
        Created: {new Date(order.createdAt).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

export default KitchenHome;
