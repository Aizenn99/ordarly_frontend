import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKitchenOrders,
  updateKOTStatus,
} from "@/store/kitchen-slice/order-slice";
import io from "socket.io-client";
import toast from "react-hot-toast";

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
const SENT_KEY     = "sent_items_map";

export default function KitchenHome() {
  const dispatch    = useDispatch();
  const { orders }  = useSelector((s) => s.kitchenOrder);
  const currentUser = useSelector((s) => s.auth.user.username);

  const [preparedItemsMap, setPreparedItemsMap] = useState({});
  const [sentItemsMap,     setSentItemsMap]     = useState({});

  useEffect(() => {
    const rawP = JSON.parse(localStorage.getItem(PREPARED_KEY) || "{}");
    const rawS = JSON.parse(localStorage.getItem(SENT_KEY)     || "{}");
    const toSets = (o) => {
      const out = {};
      for (const k in o) out[k] = new Set(o[k]);
      return out;
    };
    setPreparedItemsMap(toSets(rawP));
    setSentItemsMap(toSets(rawS));
  }, []);

  useEffect(() => {
    dispatch(fetchKitchenOrders());
    socket.on("new-kot",        () => dispatch(fetchKitchenOrders()));
    socket.on("kot-item-ready", () => dispatch(fetchKitchenOrders()));
    socket.on("kot-order-ready", ({ username, message }) => {
      if (username === currentUser) {
        toast.success(message);
        dispatch(fetchKitchenOrders());
      }
    });
    return () => {
      socket.off("new-kot");
      socket.off("kot-item-ready");
      socket.off("kot-order-ready");
    };
  }, [dispatch, currentUser]);

  const saveMap = (map, key) => {
    const obj = {};
    for (const id in map) obj[id] = Array.from(map[id]);
    localStorage.setItem(key, JSON.stringify(obj));
  };

  const handleItemCheck = (orderId, idx, checked) => {
    if (sentItemsMap[orderId]?.has(idx)) return;
    setPreparedItemsMap((prev) => {
      const s = new Set(prev[orderId] || []);
      checked ? s.add(idx) : s.delete(idx);
      const nxt = { ...prev, [orderId]: s };
      saveMap(nxt, PREPARED_KEY);
      return nxt;
    });
  };

  const handleSelectAll = (orderId, count) => {
    const sentSet = sentItemsMap[orderId] || new Set();
    const s = new Set();
    for (let i = 0; i < count; i++) if (!sentSet.has(i)) s.add(i);
    setPreparedItemsMap((prev) => {
      const nxt = { ...prev, [orderId]: s };
      saveMap(nxt, PREPARED_KEY);
      return nxt;
    });
  };

  const handleMarkPrepared = (order) => {
    const id       = order._id;
    const prepared = preparedItemsMap[id] || new Set();
    const sent     = sentItemsMap[id]     || new Set();
    const newly    = [...prepared].filter((i) => !sent.has(i));
    if (!newly.length) return;

    const payload = {
      kotNumber: order.kotNumber,
      username:  order.username,
      tableName: order.tableName,
      spaceName: order.spaceName,
      items:     newly.map((i) => order.items[i]),
      message:   `Items ready for table ${order.tableName}`,
    };
    socket.emit("kot-ready", payload);

    setSentItemsMap((prev) => {
      const s = new Set(prev[id] || []);
      newly.forEach((i) => s.add(i));
      const nxt = { ...prev, [id]: s };
      saveMap(nxt, SENT_KEY);
      return nxt;
    });

    if ((sentItemsMap[id]?.size || 0) + newly.length === order.items.length) {
      dispatch(updateKOTStatus({ kotNumber: order.kotNumber, status: "ready" }));
      setPreparedItemsMap((prev) => {
        const c = { ...prev }; delete c[id]; saveMap(c, PREPARED_KEY); return c;
      });
      setSentItemsMap((prev) => {
        const c = { ...prev }; delete c[id]; saveMap(c, SENT_KEY); return c;
      });
    }
  };

  // date + space filters
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedDate,  setSelectedDate]  = useState(todayStr);
  const [selectedSpace, setSelectedSpace] = useState("All");

  const dateFiltered = useMemo(
    () =>
      orders.filter((o) =>
        new Date(o.createdAt).toISOString().slice(0, 10) === selectedDate
      ),
    [orders, selectedDate]
  );

  const spacesList = useMemo(() => {
    const set = new Set(dateFiltered.map((o) => o.spaceName));
    return ["All", ...set];
  }, [dateFiltered]);

  useEffect(() => {
    setSelectedSpace("All");
  }, [selectedDate]);

  const displayedOrders = useMemo(() => {
    const base =
      selectedSpace === "All"
        ? dateFiltered
        : dateFiltered.filter((o) => o.spaceName === selectedSpace);
    const pending = base.filter((o) => o.status !== "ready");
    const ready   = base.filter((o) => o.status === "ready");
    return [...pending, ...ready];
  }, [dateFiltered, selectedSpace]);

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4"><CurrentDate/></div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard title="Total Orders"
                     count={dateFiltered.length}
                     color="yellow"/>
        <SummaryCard title="Served"
                     count={dateFiltered.filter(o => o.status==="ready").length}
                     color="green"/>
        <SummaryCard title="To Be Prepared"
                     count={dateFiltered.filter(o => o.status!=="ready").length}
                     color="red"/>
      </div>

      {/* date picker */}
      <div className="mb-4">
        <label className="mr-2 text-sm">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border rounded p-1"
        />
      </div>

      {/* space navbar */}
      <div className="flex overflow-x-auto scrollbar-hide flex-nowrap space-x-2 mb-6 pb-2 -mx-2 px-2">
        {spacesList.map(space => (
          <Button
          className="curosr-pointer"
            key={space}
            variant={space===selectedSpace?"default":"outline"}
            onClick={()=>setSelectedSpace(space)}
          >
            {space}
          </Button>
        ))}
      </div>

      <Accordion type="multiple" className="space-y-4">
        {displayedOrders.map(order => {
          const prepared = preparedItemsMap[order._id] || new Set();
          const sent     = sentItemsMap[order._id]     || new Set();
          return (
            <AccordionItem key={order._id} value={order._id}>
              <div className="border rounded-xl p-4 shadow">
                <OrderHeader order={order}/>
                <AccordionTrigger className="w-full justify-center mt-1">
                  Show Items
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Items</p>
                      <button
                        className="text-xs underline"
                        onClick={()=>handleSelectAll(order._id, order.items.length)}
                      >
                        Select All
                      </button>
                    </div>
                    {order.items.map((item, idx) => {
                      const isPrep = prepared.has(idx);
                      const isSent = sent.has(idx);
                      return (
                        <div
                          key={idx}
                          className="flex justify-between text-sm items-center py-1 mb-1"
                        >
                          <span className="w-3/5">
                            {idx+1}.{" "}
                            <span className={isSent?"line-through text-green-600":""}>
                              {item.itemName}
                            </span>
                          </span>
                          <span className="text-center w-1/5">{item.quantity}</span>
                          <Checkbox
                            checked={isPrep}
                            disabled={isSent}
                            onCheckedChange={ch=>handleItemCheck(order._id, idx, ch)}
                          />
                        </div>
                      );
                    })}
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Button className="text-white"
                              onClick={()=>handleMarkPrepared(order)}>
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
}

const SummaryCard = ({ title, count, color }) => (
  <div className={`bg-${color}-100 border border-${color}-400 rounded-xl text-center py-4 shadow`}>
    <p className="font-semibold">{title}</p>
    <p className="text-2xl">{count}</p>
  </div>
);

const OrderHeader = ({ order }) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="font-semibold">Order #{order.kotNumber}</p>
      <p className="text-sm text-primary1">{order.spaceName}</p>
      <p className="text-sm">Staff | <span className="text-primary1">{order.username}</span></p>
      <p className="text-sm">Table <span className="text-primary1">{order.tableName}</span> • {order.guestCount} guests</p>
    </div>
    <div className="text-right">
      <span className={`text-xs px-2 py-1 rounded-full ${
        order.status==="ready"?"bg-green-200 text-green-700":"bg-red-200 text-red-700"
      }`}>Status: {order.status.toUpperCase()}</span>
      <p className="text-xs text-gray-500 mt-3">
        Created: {new Date(order.createdAt).toLocaleTimeString("en-US", {
          hour12:true, hour:"2-digit", minute:"2-digit"
        })}
      </p>
    </div>
  </div>
);
