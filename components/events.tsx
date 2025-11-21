"use client";

import { useState, useEffect } from 'react';
import { format, parse, isFuture } from 'date-fns';
import { Plus, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { Nunito } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const englebertFont = Nunito({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-englebert",
});

interface Event {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  color: string;
  description?: string;
}

interface ServerEvent {
  _id?: string;
  id?: string | number;
  title: string;
  date: string;
  start: string;
  end: string;
  color: string;
  description?: string;
}

export default function Events() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start: '',
    end: '',
    color: 'bg-blue-100 border-l-4 border-blue-500',
    description: ''
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // fetch events from server and normalize ids
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        const normalized = (data as ServerEvent[]).map(e => ({
          ...e,
          id: e._id ? String(e._id) : (e.id ? String(e.id) : crypto?.randomUUID?.() ?? String(Date.now()))
        } as Event));
        setEvents(normalized);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  const colorOptions = [
    { id: 'blue', color: 'bg-blue-100 border-l-4 border-blue-500' },
    { id: 'green', color: 'bg-green-100 border-l-4 border-green-500' },
    { id: 'purple', color: 'bg-purple-100 border-l-4 border-purple-500' },
    { id: 'yellow', color: 'bg-yellow-100 border-l-4 border-yellow-500' },
    { id: 'pink', color: 'bg-pink-100 border-l-4 border-pink-500' },
  ];

  const handleSubmit = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.start || !newEvent.end) return;

    if (editingEvent) {
      // Update existing event
      try {
        const res = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEvent.id,
            ...newEvent
          })
        });

        if (!res.ok) throw new Error('Failed to update event');

        // Update local state after successful server update
        const updatedEvents = events.map(event => {
          if (event.id === editingEvent.id) {
            return {
              ...event,
              title: newEvent.title,
              date: newEvent.date,
              start: newEvent.start,
              end: newEvent.end,
              color: newEvent.color,
              description: newEvent.description
            };
          }
          return event;
        });
        setEvents(updatedEvents);
        setEditingEvent(null);
      } catch (err) {
        console.error('Error updating event:', err);
      }
    } else {
      // Create new event
      const tempId = crypto?.randomUUID?.() ?? String(Date.now());
      const eventToCreate = {
        id: tempId,
        ...newEvent
      };

      try {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventToCreate)
        });

        if (!res.ok) throw new Error('Failed to create event');
        
        const saved = await res.json();
        const normalized = {
          ...saved,
          id: saved._id ? String(saved._id) : (saved.id ? String(saved.id) : tempId)
        } as Event;
        
        setEvents(prev => [...prev, normalized]);
      } catch (err) {
        console.error('Error creating event:', err);
        // Fall back to client-side add with temp id
        setEvents(prev => [...prev, eventToCreate as Event]);
      }
    }

    setNewEvent({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      start: '',
      end: '',
      color: 'bg-blue-100 border-l-4 border-blue-500',
      description: ''
    });

    setIsModalOpen(false);
  };

  return (
    <div className={`${englebertFont.className} p-8 flex-row justify-between`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <motion.h2
            layout
            className="text-2xl font-bold mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Events
          </motion.h2>
          <motion.p
            layout
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Plan your upcoming events
          </motion.p>
        </div>
        <motion.button
          layout
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8054e9] text-white rounded-lg hover:bg-[#6f45d2] transition-colors"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Plus size={20} />
          <span>New Event</span>
        </motion.button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events
          .filter(event => isFuture(parse(event.date, 'yyyy-MM-dd', new Date())))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${event.color} p-4 rounded-xl`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={14} />
                      <span>{format(parse(event.date, 'yyyy-MM-dd', new Date()), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{event.start} - {event.end}</span>
                    </div>
                  </div>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingEvent(event);
                    setNewEvent({
                      title: event.title,
                      date: event.date,
                      start: event.start,
                      end: event.end,
                      color: event.color,
                      description: event.description || ''
                    });
                    setIsModalOpen(true);
                  }}
                  className="mt-2 text-sm text-[#8054e9] hover:text-[#6f45d2] transition-colors"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
      </div>

      {/* New Event Modal */}
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
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">{editingEvent ? 'Edit Event' : 'New Event'}</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEvent(null);
                    setNewEvent({
                      title: '',
                      date: format(new Date(), 'yyyy-MM-dd'),
                      start: '',
                      end: '',
                      color: 'bg-blue-100 border-l-4 border-blue-500',
                      description: ''
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8054e9]"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8054e9]"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8054e9]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8054e9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {colorOptions.map(({ id, color }) => (
                      <button
                        key={id}
                        onClick={() => setNewEvent({ ...newEvent, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${color} ${newEvent.color === color ? 'ring-2 ring-[#8054e9] ring-offset-2 scale-110' : ''
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8054e9] min-h-[100px]"
                    placeholder="Add event description..."
                  />
                </div>

                <div className="flex gap-4">
                  {editingEvent && (
                    <button
                      onClick={async () => {
                        if (!editingEvent) return;

                        try {
                          const res = await fetch(`/api/events?id=${editingEvent.id}`, {
                            method: 'DELETE'
                          });

                          if (!res.ok) throw new Error('Failed to delete event');
                          
                          // Remove from local state after successful server delete
                          setEvents(prev => prev.filter(e => e.id !== editingEvent.id));
                          setEditingEvent(null);
                          setIsModalOpen(false);
                          setNewEvent({
                            title: '',
                            date: format(new Date(), 'yyyy-MM-dd'),
                            start: '',
                            end: '',
                            color: 'bg-blue-100 border-l-4 border-blue-500',
                            description: ''
                          });
                        } catch (err) {
                          console.error('Error deleting event:', err);
                        }
                      }}
                      className="text-[18px] px-4 py-2 text-red-500  hover:bg-red-500 hover:text-white transition-all duration-200 rounded-[12px]"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    className="text-[18px] flex-1 py-2 bg-[#8054e9] text-white rounded-[12px] duration-200 hover:bg-[#6f45d2]"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
