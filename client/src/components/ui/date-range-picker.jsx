import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // This is ShadCN calendar
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Ensure this exists or replace with clsx

export function CalendarDateRangePicker({ dateRange, onUpdate }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn("w-[280px] justify-start text-left font-normal")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "dd MMM yyyy")} -{" "}
                {format(dateRange.to, "dd MMM yyyy")}
              </>
            ) : (
              format(dateRange.from, "dd MMM yyyy")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={(range) => {
            onUpdate(range);
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
