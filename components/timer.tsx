import React from "react";
import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { Nunito } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { format } from 'date-fns';

const englebertFont = Nunito({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-englebert",
});

interface Break {
    startTime: number; // minutes from start
    duration: number; // minutes
}

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    comments: number;
    time: string | number;
    date: string;
    label: string;
}

export default function TimerComponent() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
    const [totalMinutes, setTotalMinutes] = useState(25);
    const [numBreaks, setNumBreaks] = useState(0);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(totalMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [breaks, setBreaks] = useState<Break[]>([]);
    const [currentPhase, setCurrentPhase] = useState<'work' | 'break'>('work');
    const [setupComplete, setSetupComplete] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Fetch todos
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const res = await fetch("/api/todos");
                if (!res.ok) throw new Error("Failed to fetch todos");
                const data = await res.json();
                setTodos(data.map((t: { _id?: string, id?: string } & Omit<Todo, 'id'>) => ({
                    ...t,
                    id: t._id ? String(t._id) : String(t.id)
                })));
            } catch (err) {
                console.error(err);
            }
        };
        fetchTodos();
    }, []);

    // Calculate break schedule when configuration changes
    useEffect(() => {
        if (numBreaks > 0) {
            const workDuration = totalMinutes;
            const segmentDuration = workDuration / (numBreaks + 1);

            const newBreaks = Array.from({ length: numBreaks }, (_, index) => ({
                startTime: Math.round((index + 1) * segmentDuration),
                duration: breakDuration
            }));

            setBreaks(newBreaks);
        } else {
            setBreaks([]);
        }
    }, [totalMinutes, numBreaks, breakDuration]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    const newTime = prev - 1;

                    // Check if we've hit a break point
                    const currentMinute = Math.ceil((totalMinutes * 60 - newTime) / 60);
                    const breakStart = breaks.find(b => b.startTime === currentMinute);

                    if (breakStart && currentPhase === 'work') {
                        // Switch to break mode
                        setCurrentPhase('break');
                        // Play notification sound
                        new Audio('/notification.mp3').play().catch(() => { });
                    }

                    // Check if break is over
                    const activeBreak = breaks.find(b => b.startTime === currentMinute - breakDuration);
                    if (activeBreak && currentPhase === 'break') {
                        setCurrentPhase('work');
                        // Play notification sound
                        new Audio('/notification.mp3').play().catch(() => { });
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, breaks, totalMinutes, currentPhase, breakDuration]);

    const convertTimeToMinutes = (time: string | number): number => {
        if (typeof time === 'number') return time;
        const timeStr = time.toLowerCase();
        
        // Handle combined format (e.g., "1h 20min", "1h 20m", "1hour 20minutes")
        if (timeStr.includes('h') && (timeStr.includes('min') || timeStr.includes('m'))) {
            const parts = timeStr
                .replace('minutes', 'min')
                .replace('minute', 'min')
                .replace('mins', 'min')
                .replace('hours', 'h')
                .replace('hour', 'h')
                .split(/\s+/);
            
            let totalMinutes = 0;
            
            parts.forEach(part => {
                if (part.includes('h')) {
                    const hours = parseFloat(part.replace('h', ''));
                    totalMinutes += hours * 60;
                } else if (part.includes('min') || part.includes('m')) {
                    const minutes = parseInt(part.replace('min', '').replace('m', ''));
                    totalMinutes += minutes;
                }
            });
            
            return Math.round(totalMinutes);
        }
        
        // Handle hours only (e.g., "2h", "2.5h")
        if (timeStr.includes('h')) {
            const hours = parseFloat(timeStr.replace('h', ''));
            return Math.round(hours * 60);
        }
        
        // Handle time format (e.g., "2:30")
        if (timeStr.includes(':')) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return (hours * 60) + minutes;
        }
        
        // Handle plain minutes
        return parseInt(timeStr);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTaskCompletion = useCallback(async () => {
        if (selectedTask) {
            try {
                const res = await fetch(`/api/todos`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...selectedTask,
                        completed: true
                    })
                });
                if (!res.ok) throw new Error("Failed to update todo");
            } catch (err) {
                console.error(err);
            }
        }
    }, [selectedTask]);

    // Modified to check if timer is complete
    useEffect(() => {
        if (timeLeft === 0 && setupComplete) {
            handleTaskCompletion();
        }
    }, [timeLeft, setupComplete, handleTaskCompletion]);

    const handleStart = () => {
        setTimeLeft(totalMinutes * 60);
        setIsRunning(true);
        setSetupComplete(true);
        setCurrentPhase('work');
    };

    const handlePause = () => {
        setIsRunning(prev => !prev);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(totalMinutes * 60);
        setCurrentPhase('work');
        setSetupComplete(false);
    };

    const getProgressColor = () => {
        if (currentPhase === 'break') return 'bg-green-500';
        return 'bg-[#8054e9]';
    };

    return (
        <div className={`${englebertFont.className} p-8 flex-row `}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h2
                        layout
                        className="text-2xl font-bold mb-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Focus Timer
                    </motion.h2>
                    <motion.p
                        layout
                        className="text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        Today, {format(new Date(), 'd MMMM')}
                    </motion.p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm justify-center items-center flex ">

                {!setupComplete ? (
                    <div className="space-y-6 w-96 ">
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Task
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTask?.id || ""}
                                    onChange={(e) => {
                                        const task = todos.find(t => t.id === e.target.value);
                                        setSelectedTask(task || null);
                                        if (task?.time) {
                                            const timeInMinutes = convertTimeToMinutes(task.time);
                                            if (!isNaN(timeInMinutes)) {
                                                setTotalMinutes(timeInMinutes);
                                            }
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-[13px] focus:outline-none transition-all hover:border-[#8054e9] focus:border-[#8054e9] appearance-none"
                                >
                                    <option value="">Select a task...</option>
                                    {todos.filter(todo => !todo.completed).map(todo => (
                                        <option key={todo.id} value={todo.id}>
                                            {todo.text} {todo.time ? `(${todo.time})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </motion.div>

                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2 ">
                                Total Time (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={totalMinutes}
                                onChange={(e) => setTotalMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-[13px] focus:outline-none transition-all hover:border-[#8054e9] focus:border-[#8054e9]"
                                disabled={selectedTask !== null}
                            />
                        </motion.div>

                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Number of Breaks
                            </label>

                            <motion.div
                                className="relative"
                                initial={false}
                                whileTap={{ scale: 0.99 }}
                            >
                                {/* Dropdown button */}
                                <motion.button
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className="w-full flex justify-between items-center px-3 py-2 border border-gray-200 rounded-[13px] focus:outline-none transition-all hover:border-[#8054e9] focus:border-[#8054e9] bg-white"
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span>{numBreaks} {numBreaks === 1 ? "break" : "breaks"}</span>
                                    <motion.div
                                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        ▼
                                    </motion.div>
                                </motion.button>

                                {/* Dropdown list with animation */}
                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-[13px] shadow-md overflow-hidden"
                                        >
                                            {Array.from({ length: 11 }, (_, i) => (
                                                <motion.div
                                                    key={i}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setNumBreaks(i);
                                                        setDropdownOpen(false);
                                                    }}
                                                    className={`px-3 py-2 text-sm cursor-pointer ${i === numBreaks ? "bg-[#8054e9]/10 text-[#8054e9]" : "text-gray-700"
                                                        }`}
                                                >
                                                    {i} {i === 1 ? "break" : "breaks"}
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>

                        {numBreaks > 0 && (
                            <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Break Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={breakDuration}
                                    onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-[13px] focus:outline-none transition-all hover:border-[#8054e9] focus:border-[#8054e9]"
                                />
                            </motion.div>
                        )}

                        <motion.button
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={handleStart}
                            className="w-full py-3 bg-[#8054e9] text-white rounded-[13px] hover:bg-[#6f45d2] transition-colors"
                        >
                            Start Timer
                        </motion.button>

                        {breaks.length > 0 && (
                            <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Break Schedule:</h3>
                                <div className="space-y-2">
                                    {breaks.map((b, i) => (
                                        <div key={i} className="text-sm text-gray-600">
                                            Break {i + 1}: at {b.startTime} minutes ({b.duration} min)
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6 w-96 ">
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                                <motion.div
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor()}`}
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timeLeft / (totalMinutes * 60)) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>
                            <div className="text-sm text-gray-500 mb-4">
                                {currentPhase === 'break' ? 'Break Time!' : 'Focus Time'}
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <motion.button
                                onClick={handlePause}
                                className="p-3 w-12 h-12 rounded-full bg-[#8054e9] text-white hover:bg-[#6f45d2] transition-colors relative flex items-center justify-center"
                                whileTap={{ scale: 0.9 }}
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isRunning ? (
                                        <motion.span
                                            key="pause"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="absolute flex items-center justify-center"
                                        >
                                            <Pause size={24} />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="play"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="absolute flex items-center justify-center"
                                        >
                                            <Play size={24} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <button
                                onClick={handleReset}
                                className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                <RotateCcw size={24} />
                            </button>
                        </div>

                        {breaks.length > 0 && (
                            <div className="text-sm text-gray-600 text-center">
                                Next break: {
                                    currentPhase === 'work'
                                        ? breaks.find(b => b.startTime > Math.ceil((totalMinutes * 60 - timeLeft) / 60))?.startTime + ' minutes'
                                        : 'In break'
                                }
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}