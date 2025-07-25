import React from "react";
import { Badge } from "@/components/ui/badge";
import { FaRegCalendarAlt } from "react-icons/fa";

const CurrentDate = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    // weekday: 'long',
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Badge className="bg-yellow-200 text-black text-sm gap-2 ">
      <FaRegCalendarAlt className="text-black " />

      {formattedDate}
    </Badge>
  );
};

export default CurrentDate;
