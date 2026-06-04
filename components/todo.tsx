"use client";

import { format } from 'date-fns';
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MessageSquare, Plus, X } from 'lucide-react';
import { Nunito } from "next/font/google";
import { useEffect, useState } from 'react';

const englebertFont = Nunito({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-englebert",
});

interface Todo {
    id: string;
    _id?: string;
    text: string;
    completed: boolean;
    comments: number;
    time: string | number;
    date: string;
    label: string;
    start?: string | null;
    end?: string | null;
}

// shape returned by the server (may contain _id)
interface ServerTodo {
    _id?: string;
    id?: string | number;
    text: string;
    completed: boolean;
    comments: number;
    time: string | number;
    date: string;
    label: string;
    start?: string | null;
    end?: string | null;
}

export default function Todo() {
    const [viewMode, setViewMode] = useState<'List' | 'Board'>('List');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTodo, setNewTodo] = useState({
        text: '',
        start: '',
        end: '',
        label: 'Dev'
    });
    const [editingTodo, setEditingTodo] = useState<ServerTodo | null>(null);
    // removed duplicate `Todo` state which conflicted with component name

    const deleteTodo = async (todo: Todo) => {
        const todoId = todo._id || todo.id;
        try {
            const res = await fetch("/api/todos", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: todoId,
                    text: todo.text,
                    start: todo.start ?? null,
                    end: todo.end ?? null,
                }),
            });
            if (!res.ok) throw new Error("Failed to delete todo");
            setTodos((prev) => prev.filter((t) => t.id !== todo.id));
            window.dispatchEvent(new Event("refreshCalendar"));
        } catch (err) {
            console.error("Error deleting todo:", err);
        }
    };

    const getLabelColor = (label: string) => {
        const colors: { [key: string]: string } = {
            Dev: 'bg-[#D0C0F7] text-[var(--accent)]',
            Meeting: 'bg-[#FFCDB8] text-orange-600',
            Break: 'bg-[#B8FFD2] text-green-600'
        };
        return colors[label] || 'bg-gray-100 text-gray-600';
    };

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const res = await fetch("/api/todos");
                if (!res.ok) throw new Error("Failed to fetch todos");
                const data = await res.json();
                // normalize incoming todos to ensure a stable string id
                const normalized = (data as ServerTodo[]).map((t) => ({
                    ...t,
                    id: t._id ? String(t._id) : (t.id ? String(t.id) : crypto?.randomUUID?.() ?? String(Date.now())),
                    _id: t._id ? String(t._id) : undefined,
                } as Todo));
                setTodos(normalized);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTodos();
    }, []);


    return (
        <div className={`${englebertFont.className} p-8 flex-row justify-between `}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h2
                        layout
                        className="text-2xl font-bold mb-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Todo
                    </motion.h2>
                    <motion.p
                        layout
                        className="text-gray-500"
                        initial={{ opacity: 0, }}
                        animate={{ opacity: 1, }}
                    >Today, {format(new Date(), 'd MMMM')}</motion.p>
                </div>
                <motion.button
                    layout
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Plus size={20} />
                    <span>New Task</span>
                </motion.button>
            </div>

            {/* View Options */}
            <div className="flex gap-6 mb-8 text-sm font-medium">
                {['List', 'Board'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode as 'List' | 'Board')}
                        className={`${viewMode === mode
                            ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                            : 'text-gray-500 hover:text-[var(--accent)]'
                            } pb-2`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {viewMode === "Board" && (
                <div>
                    <motion.div className="space-y-3 w-100 "
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {todos.map((todo) => (
                            <div
                                key={todo.id}
                                className="group flex items-center justify-between rounded-xl border border-zinc-700/60 bg-zinc-900/80 px-4 py-4 shadow-sm transition-all hover:border-zinc-600 hover:bg-zinc-800/80"
                            >
                                {/* Left Side */}
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        className="w-6 h-6 rounded-[8px] border-2 border-[var(--accent)] relative flex items-center justify-center"
                                        onClick={() => {
                                            deleteTodo(todo);
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    ></motion.button>

                                    <div>
                                        <h3 className="text-white text-base font-medium leading-snug">
                                            {todo.text}
                                        </h3>
                                    </div>
                                </div>

                                {/* Right Side */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setNewTodo({
                                                text: todo.text,
                                                start: todo.start || '',
                                                end: todo.end || '',
                                                label: todo.label
                                            });
                                            setEditingTodo(todo);
                                            setIsModalOpen(true);
                                        }}
                                        className="px-2 py-1 text-gray-500 hover:text-[var(--accent)] transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Todo List */}
            {viewMode === "List" && (
                <div className="space-y-3">
                    <AnimatePresence>
                        {todos.map((todo) => (
                            <motion.div
                                key={todo.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`p-4 rounded-xl transition-all ${todo.completed
                                    ? ''
                                    : 'bg-white hover:shadow-md'
                                    }`}
                                style={{
                                    backgroundColor: "var(--bg)",
                                    color: "var(--text)",
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <motion.button
                                        className="w-6 h-6 rounded-[8px] border-2 border-[var(--accent)] relative flex items-center justify-center"
                                        onClick={() => {
                                            deleteTodo(todo);
                                        }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                backgroundColor: todo.completed ? "var(--accent)" : "transparent"
                                            }}
                                            className="absolute inset-0 rounded-[3px] "
                                        >
                                            {todo.completed && (
                                                <motion.svg
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 1 }}
                                                    exit={{ pathLength: 0, opacity: 0 }}
                                                    viewBox="0 0 24 24"
                                                    className="w-full h-full text-white stroke-1"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <motion.path
                                                        d="M4 12l6 6L20 6"
                                                        stroke="currentColor"
                                                    />
                                                </motion.svg>
                                            )}
                                        </motion.div>
                                    </motion.button>
                                    <motion.span
                                        className="flex-1 font-medium"
                                        style={{
                                            backgroundColor: "var(--bg)",
                                            color: "var(--text)",
                                        }}
                                    >
                                        {todo.text}
                                    </motion.span>
                                    <span className={`px-3 py-1 rounded-full text-sm ${todo.completed ? 'bg-white/20' : getLabelColor(todo.label)
                                        }`}>
                                        {todo.label}
                                    </span>
                                    <button
                                        onClick={() => {
                                            setNewTodo({
                                                text: todo.text,
                                                start: todo.start || '',
                                                end: todo.end || '',
                                                label: todo.label
                                            });
                                            setEditingTodo(todo);
                                            setIsModalOpen(true);
                                        }}
                                        className="px-2 py-1 text-gray-500 hover:text-[var(--accent)] transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Metadata */}
                                <div className="flex gap-4 ml-8 mt-2 text-sm">
                                    {todo.comments > 0 && (
                                        <div className="flex items-center gap-1">
                                            <MessageSquare size={14} />
                                            <span>{todo.comments}</span>
                                        </div>
                                    )}
                                    {todo.time && todo.time !== '0' && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{todo.time}</span>
                                        </div>
                                    )}
                                    <span>{todo.date}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* New Task Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-md"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: "var(--bg)",
                                color: "var(--text)",
                            }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">{editingTodo ? 'Edit Task' : 'New Task'}</h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingTodo(null);
                                        setNewTodo({ text: '', start: '', end: '', label: 'Dev' });
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        value={newTodo.text}
                                        onChange={(e) => setNewTodo({ ...newTodo, text: e.target.value })}
                                        className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                                        placeholder="Enter task title"
                                    />
                                </div>

                                <div>
                                    <div className="flex gap-3 items-center">
                                        <h1 className="font-bold text-[14px]">Time</h1>
                                        <input
                                            type="time"
                                            value={newTodo.start || ""}
                                            onChange={(e) => setNewTodo({ ...newTodo, start: e.target.value })}
                                            className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                                        />
                                        <input
                                            type="time"
                                            value={newTodo.end || ""}
                                            onChange={(e) => setNewTodo({ ...newTodo, end: e.target.value })}
                                            className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Label
                                    </label>
                                    <select
                                        value={newTodo.label}
                                        onChange={(e) => setNewTodo({ ...newTodo, label: e.target.value })}
                                        className="w-full text-[18px] hover:border-2 border-2 border-[#ffffff]/20 hover:border-[#8054e9] transition-all duration-150 focus:border-[#8054e9] outline-none rounded-[13px] px-3 py-2 flex-1"
                                        style={{
                                            backgroundColor: "var(--bg)",
                                            color: "var(--text)",
                                        }}
                                    >
                                        <option value="Dev">Dev</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Break">Break</option>
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    {editingTodo && (
                                        <button
                                            onClick={async () => {
                                                if (!editingTodo) return;

                                                try {
                                                    await fetch("/api/todos", {
                                                        method: "DELETE",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            id: editingTodo._id || editingTodo.id,
                                                            text: editingTodo.text,
                                                            start: editingTodo.start || null,
                                                            end: editingTodo.end || null,
                                                        }),
                                                    });
                                                } catch (err) {
                                                    console.error("Error deleting todo:", err);
                                                }

                                                setTodos(prev => prev.filter(t => t.id !== editingTodo.id));
                                                setEditingTodo(null);
                                                setIsModalOpen(false);
                                                setNewTodo({ text: "", start: "", end: "", label: "Dev" });

                                                // Refresh calendar if open
                                                window.dispatchEvent(new Event("refreshCalendar"));
                                            }}
                                            className="text-[18px] px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 rounded-[12px]"
                                        >
                                            Delete
                                        </button>

                                    )}
                                    <button
                                        onClick={async () => {
                                            if (!newTodo.text.trim()) return;

                                            const startTime = newTodo.start ? new Date(`1970-01-01T${newTodo.start}`) : null;
                                            const endTime = newTodo.end ? new Date(`1970-01-01T${newTodo.end}`) : null;
                                            const timeDiffInMinutes = startTime && endTime
                                                ? (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                                                : 0;

                                            const hours = Math.floor(timeDiffInMinutes / 60);
                                            const minutes = Math.round(timeDiffInMinutes % 60);
                                            const timeDisplay =
                                                hours > 0
                                                    ? minutes > 0
                                                        ? `${hours}h ${minutes}m`
                                                        : `${hours}h`
                                                    : minutes > 0
                                                        ? `${minutes}m`
                                                        : 0;

                                            const color =
                                                newTodo.label === "Dev"
                                                    ? "bg-purple-300 border-l-4 border-purple-500"
                                                    : newTodo.label === "Meeting"
                                                        ? "bg-orange-300 border-l-4 border-orange-500"
                                                        : "bg-green-300 border-l-4 border-green-500";

                                            if (editingTodo) {
                                                try {
                                                    const updatedTask = {
                                                        text: newTodo.text,
                                                        title: newTodo.text,

                                                        time: timeDisplay,

                                                        label: newTodo.label,
                                                        color,

                                                        date: format(new Date(), "yyyy-MM-dd"),

                                                        start: newTodo.start || null,
                                                        end: newTodo.end || null,
                                                    };

                                                    const res = await fetch("/api/todos", {
                                                        method: "PUT",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            id: editingTodo._id || editingTodo.id,
                                                            ...updatedTask,
                                                        }),
                                                    });

                                                    if (!res.ok) {
                                                        throw new Error("Failed to update todo");
                                                    }

                                                    const updatedTodo = await res.json();

                                                    setTodos((prev) =>
                                                        prev.map((todo) =>
                                                            todo.id === editingTodo.id
                                                                ? {
                                                                    ...todo,
                                                                    ...updatedTodo,
                                                                    id: updatedTodo._id
                                                                        ? String(updatedTodo._id)
                                                                        : todo.id,
                                                                }
                                                                : todo
                                                        )
                                                    );

                                                    setEditingTodo(null);
                                                    window.dispatchEvent(new Event("refreshCalendar"));

                                                } catch (err) {
                                                    console.error("Error updating todo:", err);
                                                }

                                            } else {
                                                // Create new task
                                                const newTask = {
                                                    id: crypto?.randomUUID?.() ?? String(Date.now()),

                                                    text: newTodo.text,
                                                    title: newTodo.text,

                                                    completed: false,
                                                    comments: 0,

                                                    time: timeDisplay,

                                                    date: format(new Date(), "yyyy-MM-dd"),

                                                    label: newTodo.label,
                                                    color,

                                                    start: newTodo.start || null,
                                                    end: newTodo.end || null,
                                                };


                                                try {
                                                    const res = await fetch("/api/todos", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify(newTask),
                                                    });

                                                    if (!res.ok) throw new Error("Failed to save todos");

                                                    const savedTask = await res.json();
                                                    // server may return _id, normalize to `id`
                                                    const normalized = {
                                                        ...savedTask,
                                                        id: savedTask._id ? String(savedTask._id) : (savedTask.id ? String(savedTask.id) : newTask.id)
                                                    };
                                                    setTodos(prev => [...prev, normalized]);
                                                    window.dispatchEvent(new Event("refreshCalendar"));
                                                } catch (err) {
                                                    console.error("Error saving todo:", err);
                                                }

                                            }

                                            setNewTodo({ text: "", start: "", end: "", label: "Dev" });
                                            setIsModalOpen(false);
                                        }}
                                        className="text-[18px] flex-1 py-2 bg-[var(--accent)] text-white rounded-[12px] duration-200 hover:bg-[var(--accent-hover)]"
                                    >
                                        {editingTodo ? "Update Task" : "Add Task"}
                                    </button>

                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
