
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 select-none bg-white rounded-xl shadow-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6 w-[360px]",
        caption: "flex justify-center pt-1 relative items-center px-8",
        caption_label: "text-base font-medium text-gray-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "flex w-full",
        head_cell: "w-[45px] font-medium text-[0.875rem] text-gray-500 mb-2 text-center",
        row: "flex w-full mt-1 gap-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-transparent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-full transition-all aria-selected:opacity-100",
          "hover:bg-gray-100 hover:text-gray-900",
          "focus:bg-gray-100 focus:text-gray-900 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-stella-royal text-white hover:bg-stella-royal/90 hover:text-white",
          "focus:bg-stella-royal focus:text-white",
          "shadow-sm transition-all"
        ),
        day_today: cn(
          "bg-stella-purple/10 text-stella-purple font-medium",
          "hover:bg-stella-purple/20 hover:text-stella-purple",
          "focus:bg-stella-purple/20 focus:text-stella-purple"
        ),
        day_outside: cn(
          "text-gray-400 opacity-50 aria-selected:bg-gray-100/50 aria-selected:text-gray-500 aria-selected:opacity-30",
          "hover:bg-transparent hover:text-gray-400",
          "focus:bg-transparent focus:text-gray-400"
        ),
        day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      locale={fr}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
