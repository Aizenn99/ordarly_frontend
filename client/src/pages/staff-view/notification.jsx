import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eventBus } from "@/utils/eventBus"; // ✅ import eventBus

const StaffNotifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);

  // ✅ Initial load + subscribe to kot-notification
  useEffect(() => {
    // Load existing notifications
    const stored = localStorage.getItem("staff_notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    }

    // Listen for real-time updates via eventBus
    const handler = (updated) => {
      setNotifications(updated);
    };

    eventBus.on("kot-notification", handler);

    return () => {
      eventBus.off("kot-notification", handler);
    };
  }, []);

  const handleServe = (timestamp) => {
    const updated = notifications.filter((n) => n.timestamp !== timestamp);
    setNotifications(updated);
    localStorage.setItem("staff_notifications", JSON.stringify(updated));
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">📢 Kitchen Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.timestamp} className="bg-white shadow rounded-xl p-4">
              <CardContent className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">KOT #{notif.kotNumber}</p>
                  <Badge variant="default">Ready</Badge>
                </div>

                <p className="text-lg font-medium">
                  Table: <span className="font-bold">{notif.tableName || "N/A"}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Prepared By: {notif.username || "Unknown"}
                </p>
                <p className="text-sm text-gray-700">
                  Space: {notif.spaceName || "N/A"}
                </p>

                {notif.items?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Prepared Items:</p>
                    <ul className="list-disc list-inside text-sm text-gray-800">
                      {notif.items.map((item, i) => (
                        <li key={i}>
                          {item.itemName} - Qty: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-sm text-green-600 font-semibold mt-2">{notif.message}</p>

                <Button
                  type="button"
                  className="self-center mt-2"
                  onClick={() => handleServe(notif.timestamp)}
                >
                  Served
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffNotifications;
