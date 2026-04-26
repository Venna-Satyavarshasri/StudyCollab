// frontend/src/components/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { FaPlus } from 'react-icons/fa';
import EventModal from './EventModal.jsx';

const localizer = momentLocalizer(moment);

const CalendarView = ({ groupId }) => {
    const { axiosInstance } = useAuth();
    const socket = useSocket();
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);

    const fetchEvents = async () => {
        try {
            const res = await axiosInstance.get(`/api/groups/${groupId}/calendar`);
            const formattedEvents = res.data.map(event => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error('Failed to fetch calendar events:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchEvents();
        }
    }, [groupId]);

    useEffect(() => {
        if (socket) {
            socket.on('event:created', (newEvent) => {
                const formattedEvent = {
                    ...newEvent,
                    start: new Date(newEvent.start),
                    end: new Date(newEvent.end),
                };
                setEvents((prevEvents) => [...prevEvents, formattedEvent]);
            });
            // NEW Socket.IO listeners
            socket.on('event:updated', (updatedEvent) => {
                const formattedEvent = {
                    ...updatedEvent,
                    start: new Date(updatedEvent.start),
                    end: new Date(updatedEvent.end),
                };
                setEvents((prevEvents) =>
                    prevEvents.map((event) =>
                        event._id === updatedEvent._id ? formattedEvent : event
                    )
                );
            });
            socket.on('event:deleted', (eventId) => {
                setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
            });
        }
        
        return () => {
            if (socket) {
                socket.off('event:created');
                socket.off('event:updated');
                socket.off('event:deleted');
            }
        };
    }, [socket]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
    
        // For simplicity, let's allow users to click on the calendar to create an event with start/end
        // For now, we will create a default 1-hour event
        const now = new Date();
        const eventData = {
          title,
          description: '',
          start: now,
          end: moment(now).add(1, 'hour').toDate(),
        };

        try {
            const res = await axiosInstance.post(`/api/groups/${groupId}/calendar`, eventData);
            setEvents([...events, { ...res.data.event, start: new Date(res.data.event.start), end: new Date(res.data.event.end) }]);
            setTitle('');
        } catch (err) {
            console.error('Failed to create event:', err);
        }
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const handleUpdateEvent = async (updatedEvent) => {
        try {
            setError(null);
            await axiosInstance.put(`/api/groups/${groupId}/calendar/${updatedEvent._id}`, updatedEvent);
            setSelectedEvent(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event.');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            setError(null);
            await axiosInstance.delete(`/api/groups/${groupId}/calendar/${eventId}`);
            setSelectedEvent(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete event.');
        } finally {
            setEventToDelete(null);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-semibold mb-4">Group Calendar</h2>
            {error && (
                <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            {loading ? (
                <p className="text-gray-400">Loading calendar...</p>
            ) : (
                <>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 500 }}
                        className="bg-gray-700 p-4 rounded-lg text-white"
                        onSelectEvent={handleEventClick}
                    />
                    <form onSubmit={handleCreateEvent} className="mt-6 flex space-x-2">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add a new event"
                            className="flex-1 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded"
                            required
                        />
                        <button type="submit" className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700">
                            <FaPlus />
                        </button>
                    </form>
                </>
            )}
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onUpdate={handleUpdateEvent}
                    onDelete={(eventId) => setEventToDelete(eventId)}
                />
            )}
            {eventToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-2">Delete Event</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to delete this event? This cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEventToDelete(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(eventToDelete)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;