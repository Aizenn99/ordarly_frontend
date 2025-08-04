import React from "react";
import { Badge } from "@/components/ui/badge";
import { FaRegCalendarAlt } from "react-icons/fa";

const CurrentDate = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Badge className="inline-flex items-center bg-yellow-200 px-3 py-2 text-black text-sm space-x-2">
      <FaRegCalendarAlt size={30} />
      <span>{formattedDate}</span>
    </Badge>
  );
};

export default CurrentDate;
