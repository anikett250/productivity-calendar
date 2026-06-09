"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, addYears, subYears } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Nunito } from "next/font/google";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface CalendarEvent {
  id: string;
  _id?: string;

  title?: string;
  text?: string;

  start: string;
  end: string;

  color?: string;
  label?: string;

  date: string;

  source?: "task" | "todo";
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
  const [initialLoadDone, setInitialLoadDone] = useState(false);

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
        color: "bg-blue-300 border-l-4 border-blue-500 text-black",
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

          setEvents((prev) => [...prev, result]);

          // Open edit modal immediately
          setSelectedEvent(result);
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
    const fetchAllData = async () => {
      try {
        // fetch calendar tasks
        const tasksRes = await fetch("/api/tasks");
        const tasksData = await tasksRes.json();

        const tasks = (Array.isArray(tasksData)
          ? tasksData
          : tasksData.tasks || []
        ).map((task: CalendarEvent) => ({
          ...task,
          source: "task",
        }));

        // fetch events
        const eventsRes = await fetch("/api/events");
        const eventsData = await eventsRes.json();

        const calendarEvents = (
          Array.isArray(eventsData)
            ? eventsData
            : eventsData.events || []
        ).map((event: CalendarEvent) => ({
          ...event,
          source: "event",
        }));

        // fetch todos
        const todosRes = await fetch("/api/todos");
        const todosData = await todosRes.json();

        const todos = todosData
          .filter((todo: CalendarEvent) => todo.start && todo.end)
          .map((todo: CalendarEvent) => ({
            ...todo,
            source: "todo",
            color:
              todo.color ||
              "bg-blue-300 border-l-4 border-blue-500 text-black",
          }));

        setEvents([
          ...tasks,
          ...todos,
          ...calendarEvents,
        ]);

        setTimeout(() => {
          setInitialLoadDone(true);
        }, 100);

      } catch (err) {
        console.error(err);
      }
    };

    fetchAllData();

    const handleRefresh = () => {
      fetchAllData();
    };

    window.addEventListener(
      "refreshCalendar",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "refreshCalendar",
        handleRefresh
      );
    };
  }, []);

  // --- Edit Modal ---
  const handleEventClick = (event: CalendarEvent) => setSelectedEvent(event);
  const handleModalChange = (field: string, value: string) => {
    setSelectedEvent((prev: CalendarEvent | null) => {
      if (!prev) return null;

      const updated = { ...prev, [field]: value };

      // keep title/text synced
      if (field === "title") {
        updated.text = value;
      }

      if (field === "text") {
        updated.title = value;
      }

      return updated;
    });
  };


  const handleSave = async () => {
    if (!selectedEvent) return;

    try {
      const itemId = selectedEvent._id || selectedEvent.id;

      // TODO ITEM
      if (selectedEvent.source === "todo") {
        const res = await fetch("/api/todos", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: itemId,

            text:
              selectedEvent.title ||
              selectedEvent.text,

            title:
              selectedEvent.title ||
              selectedEvent.text,

            start: selectedEvent.start,
            end: selectedEvent.end,

            color: selectedEvent.color,
          }),
        });

        const updatedTodo = await res.json();

        if (!res.ok) {
          console.error("Failed to update todo");
          return;
        }

        setEvents((prev) =>
          prev.map((event) =>
            (event._id || event.id) === itemId
              ? {
                ...event,
                ...updatedTodo,
              }
              : event
          )
        );

        setSelectedEvent(null);

        window.dispatchEvent(
          new Event("refreshCalendar")
        );

        return;
      }

      // NORMAL TASK
      const res = await fetch(`/api/tasks/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedEvent),
      });

      const updatedTask = await res.json();

      if (!res.ok) {
        console.error("Failed to update task");
        return;
      }

      setEvents((prev) =>
        prev.map((event) =>
          (event._id || event.id) === itemId
            ? updatedTask
            : event
        )
      );

      setSelectedEvent(null);

    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    try {
      const itemId =
        selectedEvent._id || selectedEvent.id;

      // TODO DELETE
      if (selectedEvent.source === "todo") {
        await fetch("/api/todos", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: itemId,
          }),
        });
      }

      // TASK DELETE
      else {
        await fetch("/api/tasks", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: itemId,
          }),
        });
      }

      setEvents((prev) =>
        prev.filter(
          (e) =>
            (e._id || e.id) !== itemId
        )
      );

      setSelectedEvent(null);

      window.dispatchEvent(
        new Event("refreshCalendar")
      );

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleTaskDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;

    const [date, time] = String(over.id).split("|");

    const task = events.find(
      (e) => (e._id || e.id) === taskId
    );

    if (!task) return;
    if (task.source === "todo") return;

    const startHour = parseInt(time.split(":")[0], 10);

    const endHour =
      startHour +
      (
        parseInt(task.end.split(":")[0]) -
        parseInt(task.start.split(":")[0])
      );

    const updatedTask = {
      ...task,
      date,
      start: `${startHour.toString().padStart(2, "0")}:00`,
      end: `${endHour.toString().padStart(2, "0")}:00`,
    };

    // Optimistic UI
    setEvents((prev) =>
      prev.map((e) =>
        (e._id || e.id) === taskId
          ? updatedTask
          : e
      )
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleTaskDragEnd}
    >
      <div
        className={`${englebertFont.className} flex-1 rounded-2xl shadow-sm p-8 h-screen overflow-hidden flex flex-col select-none text-3xl font-bold`}
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
        }}
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
              className="flex items-center gap-1 relative p-[3px] bg-[var(--accent)] rounded-[13px]">
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
              <div className="w-[80px] flex flex-col border-r border-gray-400/15">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="text-sm text-[#757575] border-b border-gray-400/0 h-[50px] flex items-start px-2"
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
                    className="relative border-r border-gray-400/15 h-full"
                  >
                    {/* Time slots for drag */}
                    {timeSlots.map((time, timeIndex) => (
                      <DroppableSlot
                        key={time}
                        id={`${format(day, "yyyy-MM-dd")}|${time}`}
                        onMouseDown={() =>
                          handleMouseDown(dayIndex, timeIndex)
                        }
                        onMouseEnter={() =>
                          handleMouseEnter(dayIndex, timeIndex)
                        }
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
                                ? "#8EC5FF" // blue-100
                                : "#8EC5FF", // red-100
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
                          <div className="text-sm font-medium"
                            style={{
                              // backgroundColor: "var(--bg)",
                              color: "var(--text)",
                            }}
                          >
                            {dragEnd.timeIndex > dragStart.timeIndex ? "Extend Task" : "Shorten Task"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {timeSlots[Math.min(dragStart.timeIndex, dragEnd.timeIndex)]} -{" "}
                            {timeSlots[Math.max(dragStart.timeIndex, dragEnd.timeIndex) + 1] || "00:00"}
                          </div>
                          <div className="text-xs text-gray-800">
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
                          if (!event.id && !event._id) {
                            console.warn("Event found without an ID:", event);
                            return null;
                          }

                          const startHour = parseInt(
                            event.start.split(":")[0],
                            10
                          );

                          const endHour = parseInt(
                            event.end.split(":")[0],
                            10
                          );

                          const top =
                            (startHour * 100) / timeSlots.length;

                          const height =
                            ((endHour - startHour) * 100) /
                            timeSlots.length;

                          return (
                            <DraggableEvent
                              key={event._id || event.id}
                              event={event}
                              top={top}
                              height={height}
                              initialLoadDone={initialLoadDone}
                              onClick={() => handleEventClick(event)}
                            />
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full overflow-hidden rounded-[28px]"
              style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
            >
              {view === "Year" ? (
                // YEAR VIEW
                <div className="grid grid-cols-4 gap-x-8 gap-y-10 h-full w-full p-6 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, monthIndex) => {
                    const monthStart = new Date(currentDate.getFullYear(), monthIndex, 1);
                    const daysInMonth = displayDays.filter(
                      (day) => day.getMonth() === monthIndex
                    );
                    const startPadding = startOfMonth(monthStart).getDay(); // 0=Sun

                    return (
                      <div key={monthIndex} className="flex flex-col">
                        {/* MONTH NAME */}
                        <h2
                          className="mb-3 text-base font-semibold"
                          style={{ color: "var(--text)" }}
                        >
                          {format(monthStart, "MMMM")}
                        </h2>

                        {/* WEEKDAY HEADERS */}
                        <div className="mb-1 grid grid-cols-7 text-center">
                          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                            <div
                              key={i}
                              className="text-[11px] font-medium py-0.5"
                              style={{ color: "var(--text)", opacity: 0.45 }}
                            >
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* DAY GRID */}
                        <div className="grid grid-cols-7 text-center">
                          {/* Leading empty cells */}
                          {Array.from({ length: startPadding }, (_, i) => (
                            <div key={`empty-${i}`} className="h-7" />
                          ))}

                          {daysInMonth.map((day, i) => {
                            const isToday =
                              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                            const hasEvent = events.some(
                              (e) => e && e.date === format(day, "yyyy-MM-dd")
                            );

                            return (
                              <div
                                key={i}
                                className="relative flex h-7 items-center justify-center text-xs font-medium cursor-pointer transition-all duration-150 rounded-full hover:opacity-80"
                                style={{
                                  backgroundColor: isToday
                                    ? "var(--accent, #2563eb)"
                                    : "transparent",
                                  color: isToday ? "#fff" : "var(--text)",
                                }}
                                onClick={() => {
                                  setCurrentDate(day);
                                  setView("Day");
                                }}
                              >
                                {format(day, "d")}
                                {/* Event dot */}
                                {hasEvent && !isToday && (
                                  <span
                                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                                    style={{ backgroundColor: "var(--accent, #2563eb)" }}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // MONTH VIEW
                <div className="flex h-full w-full flex-col">
                  {/* WEEKDAY HEADERS */}
                  <div className="grid grid-cols-7 border-b border-white/10">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div
                        key={d}
                        className="py-2 text-center text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: "var(--text)", opacity: 0.4 }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* DAY GRID */}
                  <div className="grid flex-1 grid-cols-7">
                    {displayDays.map((day, dayIndex) => {
                      const isCurrentMonth =
                        format(day, "MM-yyyy") === format(currentDate, "MM-yyyy");
                      const isToday =
                        format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

                      return (
                        <motion.div
                          key={dayIndex}
                          layout
                          className="relative flex flex-col border-r border-b border-white/10 p-2 min-h-[160px] transition-colors duration-200"
                          style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
                        >
                          {/* DATE */}
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold cursor-pointer hover:ring-2 hover:ring-[var(--accent)]"
                            style={{
                              backgroundColor: isToday ? "var(--accent, #4f6ef7)" : "transparent",
                              color: isToday ? "#fff" : "var(--text)",
                              opacity: isCurrentMonth ? 1 : 0.35,
                            }}
                            onClick={() => {
                              setCurrentDate(day);
                              setView("Day");
                            }}
                          >
                            {format(day, "d")}
                          </div>

                          {/* EVENTS */}
                          <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                            {events
                              .filter((e) => e && e.date === format(day, "yyyy-MM-dd"))
                              .map((event) => (
                                <motion.div
                                  key={event.id}
                                  layout
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 6 }}
                                  transition={{ duration: 0.2 }}
                                  onClick={() => handleEventClick(event)}
                                  className="cursor-pointer overflow-hidden rounded-md px-2 py-1 text-[11px] font-medium shadow-sm"
                                  style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
                                >
                                  <p className="truncate">{event.title || event.text}</p>
                                </motion.div>
                              ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>



        {/* Edit Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                style={{
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
                className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">
                    {selectedEvent.source === "todo"
                      ? "Todo Task"
                      : "Edit Task"}
                  </h3>
                  <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-gray-700">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3 ">
                  <h1 className="font-bold text-[14px] ">Title</h1>
                  <input
                    type="text"
                    value={selectedEvent.title || selectedEvent.text || ""}
                    className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                    onChange={(e) => {
                      handleModalChange("title", e.target.value);
                      handleModalChange("text", e.target.value);
                    }}
                  />
                  <div className="flex gap-3 items-center ">
                    <h1 className="font-bold text-[14px] ">Time</h1>
                    <input
                      type="time"
                      value={selectedEvent.start}
                      onChange={(e) => handleModalChange("start", e.target.value)}
                      className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                    />
                    <input
                      type="time"
                      value={selectedEvent.end}
                      onChange={(e) => handleModalChange("end", e.target.value)}
                      className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                    />
                  </div>
                  {/* Color Picker */}
                  <div className="flex items-center gap-3 mt-2">
                    <h1 className="font-bold text-[14px] ">Label Color</h1>
                    {[
                      { id: "blue", color: "bg-blue-500", classes: "bg-blue-300 border-l-4 border-blue-500 text-black" },
                      { id: "green", color: "bg-green-500", classes: "bg-green-300 border-l-4 border-green-500 text-black" },
                      { id: "purple", color: "bg-purple-500", classes: "bg-purple-300 border-l-4 border-purple-500 text-black" },
                      { id: "yellow", color: "bg-yellow-500", classes: "bg-yellow-300 border-l-4 border-yellow-500 text-black" },
                      { id: "pink", color: "bg-pink-500", classes: "bg-pink-300 border-l-4 border-pink-500 text-black" },
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
                  <>
                    <button
                      onClick={handleDelete}
                      className="text-[18px] px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 rounded-[12px]"
                    >
                      Delete
                    </button>

                    <button
                      onClick={handleSave}
                      className="text-[18px] px-5 py-2 bg-[var(--accent)] text-white rounded-[12px] duration-200 hover:bg-[var(--accent-hover)]"
                    >
                      Save
                    </button>
                  </>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndContext>


  );

  function DroppableSlot({
    id,
    onMouseDown,
    onMouseEnter,
  }: {
    id: string;
    onMouseDown: () => void;
    onMouseEnter: () => void;
  }) {
    const { setNodeRef, isOver } = useDroppable({
      id,
    });

    return (
      <div
        ref={setNodeRef}
        className={`
        border-t
        border-gray-400/15
        h-[50px]
        relative
        transition-colors
        ${isOver
            ? "bg-blue-500/10"
            : ""
          }
      `}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
      />
    );
  }

  function DraggableEvent({
    event,
    top,
    height,
    initialLoadDone,
    onClick,
  }: {
    event: CalendarEvent;
    top: number;
    height: number;
    initialLoadDone: boolean;
    onClick: () => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
    } = useDraggable({
      id: event._id || event.id,
    });


    const style = {
      top: `${top}%`,
      height: `${height}%`,
      transform: transform
        ? `translate3d(
          ${transform.x}px,
          ${transform.y}px,
          0
        )`
        : undefined,
    };

    return (
      <motion.div
        initial={
          !initialLoadDone
            ? { opacity: 0 }
            : false
        }
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        onClick={onClick}
        className={`
        ${event.color}
        absolute
        text-black
        p-2
        rounded-lg
        w-[90%]
        left-[5%]
        shadow-sm
        hover:shadow-md
${event.source === "todo"
            ? "cursor-default"
            : "cursor-grab active:cursor-grabbing"}
        z-10
      `}
      >
        <div className="text-sm text-black font-medium">
          {event.title || event.text}
        </div>

        <div className="text-xs text-gray-500">
          {event.start} - {event.end}
        </div>
      </motion.div>
    );
  }

}
