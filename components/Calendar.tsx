"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, addYears, subYears } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Nunito } from "next/font/google";

interface CalendarEvent {
  id?: string;
  _id?: string;
  title: string;
  start: string;
  end: string;
  color: string;
  date: string;
}

const englebertFont = Nunito({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-englebert",
});

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("Week");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [dragStart, setDragStart] = useState<{ dayIndex: number; timeIndex: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ dayIndex: number; timeIndex: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null); // for modal

  // No need to fetch from API anymore, just use local state

  // Generate time slots from 00:00 to 23:00
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return `${i.toString().padStart(2, "0")}:00`;
  });

  // Get displayed days based on view
  const getDaysForView = () => {
    switch (view) {
      case "Day":
        return [currentDate];
      case "Week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case "Month":
        const monthStart = startOfMonth(currentDate);
        const monthStartWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
        const monthEnd = endOfMonth(currentDate);
        const monthEndWeek = endOfWeek(monthEnd, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: monthStartWeek, end: monthEndWeek });
      case "Year":
        const months = Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(currentDate.getFullYear(), i, 1);
          const start = startOfMonth(monthDate);
          const end = endOfMonth(monthDate);
          return eachDayOfInterval({ start, end });
        }).flat();
        return months;
      default:
        return [];
    }
  };

  const displayDays = getDaysForView();
  const viewOptions = ["Day", "Week", "Month", "Year"];

  // --- Drag & drop create ---
  const handleMouseDown = (dayIndex: number, timeIndex: number) => {
    setDragStart({ dayIndex, timeIndex });
    setDragEnd({ dayIndex, timeIndex });
  };

  const handleMouseEnter = (dayIndex: number, timeIndex: number) => {
    if (dragStart) {
      // Allow dragging up or down from the start point
      setDragEnd({
        dayIndex: dragStart.dayIndex, // Keep in same day
        timeIndex // Allow moving to any time
      });
    }
  };
  const generateUniqueId = () => {
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `task_${timestamp}_${randomStr}`;
  };

  const handleMouseUp = async () => {
    if (dragStart && dragEnd) {
      const day = displayDays[dragStart.dayIndex];
      const start = Math.min(dragStart.timeIndex, dragEnd.timeIndex);
      const end = Math.max(dragStart.timeIndex, dragEnd.timeIndex) + 1;

      const newEvent = {
        id: generateUniqueId(),
        title: "New Task",
        start: timeSlots[start],
        end: timeSlots[end] || "17:00",
        color: "bg-blue-100 border-l-4 border-blue-500",
        date: format(day, "yyyy-MM-dd"),
      };

      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        });

        const result = await res.json();

        if (res.ok) {
          console.log("Saved to DB:", result);
          // Add the returned task (with _id and userId) to state
          setEvents((prev) => [...prev, result]);
        } else {
          console.error("Error creating task:", result.error || result.message);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    setDragStart(null);
    setDragEnd(null);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) {
          console.error("Failed to fetch tasks");
          return;
        }
        const data = await res.json();
        // Handle both array and { tasks } object responses
        const tasksArray = Array.isArray(data) ? data : (data?.tasks || []);
        setEvents(tasksArray); // populate UI with tasks from DB
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, []);

  // --- Edit Modal ---
  const handleEventClick = (event: CalendarEvent) => setSelectedEvent(event);
  const handleModalChange = (field: string, value: string) => {
    setSelectedEvent((prev: CalendarEvent | null) => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (selectedEvent) {
      setEvents(prev => prev.map(e => (e._id || e.id) === (selectedEvent._id || selectedEvent.id) ? selectedEvent : e));
      setSelectedEvent(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      // Delete from DB - use _id if available (from DB), otherwise use id
      const taskId = selectedEvent._id || selectedEvent.id;
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });

      if (!res.ok) {
        console.error("Failed to delete task from DB");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
    }

    // Remove from local state immediately
    setEvents(prev => prev.filter(e => (e._id || e.id) !== (selectedEvent._id || selectedEvent.id)));
    setSelectedEvent(null);

    // Also refresh the calendar (optional if you want it synced elsewhere)
    window.dispatchEvent(new Event("refreshCalendar"));
  };

  return (
    <div
      className={`${englebertFont.className} flex-1 bg-white rounded-2xl shadow-sm p-8 h-screen overflow-hidden flex flex-col select-none text-3xl font-bold`}
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <motion.h2
            layout
            className="text-2xl font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {format(currentDate, "dd MMMM yyyy")}
          </motion.h2>
          <span className="text-sm text-gray-500">GMT +7</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            layout
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 relative p-[3px] bg-[#8054e9] rounded-[13px]">
            {viewOptions.map((option) => (
              <div key={option} className="relative">
                {view === option && (
                  <motion.div
                    layoutId="viewBackground"
                    className="absolute inset-0 bg-white rounded-[11px]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <button
                  onClick={() => setView(option)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg relative z-10 ${view === option ? "text-[#8054e9]" : "text-white"
                    }`}
                >
                  {option}
                </button>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center rounded-[10px] gap-2">
            <button
              onClick={() => {
                switch (view) {
                  case "Day":
                    setCurrentDate(subDays(currentDate, 1));
                    break;
                  case "Week":
                    setCurrentDate(subDays(currentDate, 7));
                    break;
                  case "Month":
                    setCurrentDate(subMonths(currentDate, 1));
                    break;
                  case "Year":
                    setCurrentDate(subYears(currentDate, 1));
                    break;
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-[10px]"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => {
                switch (view) {
                  case "Day":
                    setCurrentDate(addDays(currentDate, 1));
                    break;
                  case "Week":
                    setCurrentDate(addDays(currentDate, 7));
                    break;
                  case "Month":
                    setCurrentDate(addMonths(currentDate, 1));
                    break;
                  case "Year":
                    setCurrentDate(addYears(currentDate, 1));
                    break;
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-[10px]"
            >
              <ChevronRight size={22} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Days Header */}
      {(view === "Day" || view === "Week") && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`grid ${view === "Day" ? "grid-cols-1" : "grid-cols-7"} gap-4 mb-4`}
          >
            {displayDays.map((day, i) => (
              <motion.div
                key={i}
                layout
                transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
                className="text-start ml-[15px] "
              >
                <div className="text-sm text-gray-500 font-medium">
                  {format(day, "EEE")}
                </div>
                <div className="text-lg font-bold">
                  {format(day, "d")}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Calendar Grid */}
      <div className={`flex-1 ${view === "Month" || view === "Year" ? "" : "overflow-hidden"}`}>
        {(view === "Day" || view === "Week") ? (
          // ---------- DAY & WEEK ----------
          <motion.div
            key={`grid-${view}`}
            layout
            transition={{ layout: { duration: 0.45, ease: "easeInOut" } }}
            className="flex h-full min-h-[600px]"
          >
            {/* Time column on left */}
            <div className="w-[80px] flex flex-col border-r border-gray-200">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="text-sm text-gray-500 border-b border-gray-100 h-[50px] flex items-start px-2"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Right side — day columns */}
            <div
              className={`flex-1 grid ${view === "Day" ? "grid-cols-1" : "grid-cols-7"} gap-2 relative`}
            >
              {displayDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="relative border-l border-gray-100 h-full"
                >
                  {/* Time slots for drag */}
                  {timeSlots.map((time, timeIndex) => (
                    <div
                      key={time}
                      className="border-t border-gray-100 h-[50px] relative"
                      onMouseDown={() => handleMouseDown(dayIndex, timeIndex)}
                      onMouseEnter={() => handleMouseEnter(dayIndex, timeIndex)}
                    />
                  ))}

                  {/* Live drag preview */}
                  <AnimatePresence>
                    {dragStart && dragEnd && dayIndex === dragStart.dayIndex && (
                      <motion.div
                        key={`${dragStart.dayIndex}-${dragStart.timeIndex}-${dragEnd.timeIndex}`}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          backgroundColor:
                            dragEnd.timeIndex > dragStart.timeIndex
                              ? "rgb(219 234 254)" // blue-100
                              : "rgb(254 226 226)", // red-100
                          borderLeftColor:
                            dragEnd.timeIndex > dragStart.timeIndex
                              ? "rgb(59 130 246)" // blue-500
                              : "rgb(239 68 68)", // red-500
                        }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{
                          duration: 0.18,
                          ease: "easeOut",
                        }}
                        className="absolute p-2 rounded-lg w-[90%] left-[5%] shadow-sm border-l-4"
                        style={{
                          top: `${(Math.min(dragStart.timeIndex, dragEnd.timeIndex) * 100) / timeSlots.length}%`,
                          height: `${(Math.abs(dragEnd.timeIndex - dragStart.timeIndex + 1) * 100) / timeSlots.length}%`,
                        }}
                      >
                        <div className="text-sm font-medium">
                          {dragEnd.timeIndex > dragStart.timeIndex ? "Extend Task" : "Shorten Task"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {timeSlots[Math.min(dragStart.timeIndex, dragEnd.timeIndex)]} -{" "}
                          {timeSlots[Math.max(dragStart.timeIndex, dragEnd.timeIndex) + 1] || "00:00"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Duration: {Math.abs(dragEnd.timeIndex - dragStart.timeIndex) + 1}h
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>




                  {/* Render existing tasks here */}
                  <AnimatePresence>
                    {events
                      .filter((e) => e && e.date === format(day, "yyyy-MM-dd"))
                      .map((event) => {
                        if (!event.id) {
                          console.warn('Event found without an ID:', event);
                          return null;
                        }
                        const startHour = parseInt(event.start.split(":")[0], 10);
                        const endHour = parseInt(event.end.split(":")[0], 10);
                        const top = (startHour * 100) / timeSlots.length;
                        const height = ((endHour - startHour) * 100) / timeSlots.length;

                        return (
                          <motion.div
                            key={event.id}
                            layout
                            className={`${event.color} absolute p-2 rounded-lg w-[90%] left-[5%] shadow-sm hover:shadow-md cursor-pointer`}
                            style={{ top: `${top}%`, height: `${height}%` }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="text-sm font-medium">{event.title}</div>
                            <div className="text-xs text-gray-500">
                              {event.start} - {event.end}
                            </div>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

        ) : (
          // ---------- MONTH & YEAR ----------
          <motion.div
            key={`grid-${view}`}
            layout
            transition={{ layout: { duration: 0.45, ease: "easeInOut" } }}
            className={`grid ${view === "Month" ? "grid-cols-7 gap-2" : "grid-cols-3 gap-6"
              } h-full`}
          >
            {view === "Year" ? (
              // Year view - show all months, each taking equal space
              Array.from({ length: 12 }, (_, monthIndex) => {
                const monthStart = new Date(currentDate.getFullYear(), monthIndex, 1);
                const daysInMonth = displayDays.filter(
                  (day) => day.getMonth() === monthIndex
                );

                return (
                  <motion.div
                    key={monthIndex}
                    layout
                    className="p-3 border rounded-xl bg-white shadow-sm flex flex-col"
                  >
                    <div className="text-lg font-bold mb-2 text-[#8054e9] text-center">
                      {format(monthStart, "MMMM")}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <div key={i} className="text-xs text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 flex-1">
                      {Array.from(
                        { length: startOfMonth(monthStart).getDay() - 1 },
                        (_, i) => (
                          <div key={`empty-${i}`} className="h-6" />
                        )
                      )}
                      {daysInMonth.map((day, i) => (
                        <div
                          key={i}
                          className={`h-6 text-sm flex items-center justify-center rounded-full ${events.some(
                            (e) => e && e.date === format(day, "yyyy-MM-dd")
                          )
                            ? "bg-[#8054e9] text-white"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          {format(day, "d")}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Month view - fill full height grid
              displayDays.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  layout
                  className={`p-2 border text-center rounded-[15px] ${format(day, "MM-yyyy") === format(currentDate, "MM-yyyy")
                    ? "bg-[#f8f8f8] "
                    : "bg-[#f8f8f8] "
                    } flex flex-col`}
                >
                  <div className="text-sm text-[#00000] font-medium mb-1">
                    {format(day, "d")}
                  </div>
                  <div className="flex-1">
                    {events
                      .filter((e) => e && e.date === format(day, "yyyy-MM-dd"))
                      .map((event) => (
                        <motion.div
                          key={event.id}
                          layout
                          className={`${event.color} p-1 mb-1 rounded text-xs`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => handleEventClick(event)}
                        >
                          {event.title}
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>



      {/* Edit Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Edit Task</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 ">
                <h1 className="font-bold text-[14px] ">Title</h1>
                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => handleModalChange("title", e.target.value)}
                  className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff] hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2"
                  placeholder="Task Title"
                />
                <div className="flex gap-3 items-center ">
                  <h1 className="font-bold text-[14px] ">Time</h1>
                  <input
                    type="time"
                    value={selectedEvent.start}
                    onChange={(e) => handleModalChange("start", e.target.value)}
                    className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff] hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                  />
                  <input
                    type="time"
                    value={selectedEvent.end}
                    onChange={(e) => handleModalChange("end", e.target.value)}
                    className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff] hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                  />
                </div>
                {/* Color Picker */}
                <div className="flex items-center gap-3 mt-2">
                  <h1 className="font-bold text-[14px] ">Label Color</h1>
                  {[
                    { id: "blue", color: "bg-blue-500", classes: "bg-blue-100 border-l-4 border-blue-500" },
                    { id: "green", color: "bg-green-500", classes: "bg-green-100 border-l-4 border-green-500" },
                    { id: "purple", color: "bg-purple-500", classes: "bg-purple-100 border-l-4 border-purple-500" },
                    { id: "yellow", color: "bg-yellow-500", classes: "bg-yellow-100 border-l-4 border-yellow-500" },
                    { id: "pink", color: "bg-pink-500", classes: "bg-pink-100 border-l-4 border-pink-500" },
                  ].map(({ id, color, classes }) => {
                    const isSelected = selectedEvent.color === classes;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleModalChange("color", classes)}
                        className={`w-6 h-6 rounded-full ${color} transition-transform duration-300 hover:scale-110 ${isSelected ? "ring-2 ring-offset-2 ring-[#8054e9]" : ""
                          }`}
                      />
                    );
                  })}
                </div>

              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={handleDelete}
                  className="text-[18px] px-4 py-2 text-red-500  hover:bg-red-500 hover:text-white transition-all duration-200 rounded-[12px] "
                >
                  Delete
                </button>
                <button
                  onClick={handleSave}
                  className="text-[18px] px-5 py-2 bg-[#8054e9] text-white rounded-[12px] duration-200 hover:bg-[#6f45d2]"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
