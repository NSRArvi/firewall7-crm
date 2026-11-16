"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-1 text-xs", className)}
      classNames={{
        months: "flex flex-col space-y-3",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-xs font-semibold text-slate-900 dark:text-white",
        nav: "flex items-center justify-between absolute inset-x-0 top-1 px-1",
        button_previous:
          "h-7 w-7 rounded inline-flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer",
        button_next:
          "h-7 w-7 rounded inline-flex items-center justify-center hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-slate-500 dark:text-slate-400 rounded w-8 font-medium text-[11px] text-center",
        week: "flex w-full mt-1",
        day: "h-8 w-8 text-center text-xs p-0 relative",
        day_button:
          "h-8 w-8 rounded font-normal hover:bg-[#f97316]/15 hover:text-[#f97316] inline-flex items-center justify-center cursor-pointer transition-colors",
        selected:
          "bg-[#f97316] text-white hover:bg-[#f97316] hover:text-white rounded font-semibold",
        today: "border border-[#f97316]/60 rounded font-semibold",
        outside: "text-slate-400 opacity-50",
        disabled: "text-slate-400 opacity-40",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
