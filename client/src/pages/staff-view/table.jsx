"use client";

import CurrentDate from "@/components/staff-view/date";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { addTableFormControls } from "@/config";
import { fetchSpaces, getTable } from "@/store/admin-slice/table";
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const StaffTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [collapseStates, setCollapseStates] = useState(() => {
    const stored = localStorage.getItem("collapseStates");
    return stored ? JSON.parse(stored) : {};
  });

  const guestInfo = JSON.parse(localStorage.getItem("guestInfo"));
  const { tables, spaces } = useSelector((state) => state.adminTable);
  const socket = io(`${import.meta.env.VITE_API_URL}`);

  useEffect(() => {
    socket.on("table-status-changed", (updatedTable) => {
      dispatch(getTable()); // You can optimize by updating only that table
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(getTable());
    dispatch(fetchSpaces());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem("collapseStates", JSON.stringify(collapseStates));
  }, [collapseStates]);

  const getOptionLabel = (name, id) => {
    const control = addTableFormControls.find((ctrl) => ctrl.name === name);
    return control?.options?.find((opt) => opt.id === id)?.label || id;
  };

  const availableTables = tables.filter(
    (table) => getOptionLabel("status", table.status) === "available"
  ).length;
  const occupiedTables = tables.filter(
    (table) => getOptionLabel("status", table.status) === "occupied"
  ).length;
  const reservedTables = tables.filter(
    (table) => getOptionLabel("status", table.status) === "reserved"
  ).length;

  return (
    <div className="p-3 md:p-4 mt-1">
      <div className="flex justify-end items-end mb-4">
        <span>
          <CurrentDate />
        </span>
      </div>

      {/* Table Stats */}
      <div className="w-full gap-3 mb-4 grid grid-cols-4">
        <div className="text-sm p-4 min-h-[70px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-yellow-600 bg-beige text-center whitespace-normal break-words">
          <h1>Total Tables</h1>
          <span className="text-xl text-yellow-600 mt-1 font-semibold">
            {tables.length}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[70px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-primary1 bg-green-200 text-center whitespace-normal break-words">
          <h1>Available Tables</h1>
          <span className="text-xl mt-1 text-primary1 font-semibold">
            {availableTables}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[70px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-red-600 bg-red-200 text-center whitespace-normal break-words">
          <h1>Occupied Tables</h1>
          <span className="text-xl mt-1 text-red-600 font-semibold">
            {occupiedTables}
          </span>
        </div>
        <div className="text-sm p-4 min-h-[70px] flex flex-col items-center justify-center rounded-2xl shadow-md shadow-gray-100 border border-blue-600 bg-blue-200 text-center whitespace-normal break-words">
          <h1>Reserved Tables</h1>
          <span className="text-xl mt-1 text-blue-600 font-semibold">
            {reservedTables}
          </span>
        </div>
      </div>

      {/* Spaces and Tables */}
      <div className="p-3 md:p-4 mt-4">
        {spaces && spaces.length > 0 ? (
          spaces.map((space) => {
            const tablesForSpace = tables.filter(
              (table) => table.spaces === space._id
            );
            const isOpen = collapseStates[space._id] || false;

            return (
              <Collapsible
                key={space._id}
                open={isOpen}
                onOpenChange={(open) =>
                  setCollapseStates((prev) => ({
                    ...prev,
                    [space._id]: open,
                  }))
                }
                className="mb-4"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between mb-3 gap-2 cursor-pointer rounded-md">
                    <h1 className="flex items-center gap-2 text-primary1 font-semibold">
                      {space.SpaceName}
                    </h1>
                    {isOpen ? (
                      <FaChevronUp className="text-primary1" />
                    ) : (
                      <FaChevronDown className="text-primary1" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {tablesForSpace.length > 0 ? (
                      tablesForSpace.map((table, index) => {
                        const statusLabel = getOptionLabel(
                          "status",
                          table.status
                        );

                        const cardColor =
                          statusLabel === "available"
                            ? "border-primary1"
                            : statusLabel === "occupied"
                            ? "border-red-600"
                            : statusLabel === "reserved"
                            ? "border-blue-600"
                            : "bg-gray-100";

                        const isClickable =
                          statusLabel === "available" ||
                          statusLabel === "occupied";

                        return (
                          <div
                            key={index}
                            className={`cardB w-full p-3 rounded shadow border ${cardColor} ${
                              isClickable
                                ? "cursor-pointer hover:shadow-lg transition"
                                : "pointer-events-none opacity-60"
                            }`}
                            onClick={() => {
                              if (!isClickable) return;

                              const guestCount = guestInfo?.guestCount;
                              const route = guestCount
                                ? "/staff/menu"
                                : "/staff/customer";

                              navigate(route, {
                                state: {
                                  tableId: table._id,
                                  tableName: table.tableName,
                                  spaceName: space.SpaceName,
                                  capacity: table.capacity,
                                  guestCount: guestCount,
                                },
                              });
                            }}
                          >
                            <h2 className="font-bold text-sm text-center mb-2">
                              {table.tableName}
                            </h2>
                            <p className="text-sm flex justify-center items-center gap-2 mb-2">
                              Size: {table.capacity}
                            </p>
                            <Badge
                              className={`text-sm mx-auto flex items-center justify-center mb-2
                                ${
                                  statusLabel === "available"
                                    ? "bg-green-200 text-primary1 p-1"
                                    : statusLabel === "occupied"
                                    ? "bg-red-200 text-red-600"
                                    : statusLabel === "reserved"
                                    ? "bg-blue-200 text-blue-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground col-span-full">
                        No tables in this space.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          <p className="text-muted-foreground">No spaces found.</p>
        )}
      </div>
    </div>
  );
};

export default StaffTable;
