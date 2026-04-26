import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaSpinner } from 'react-icons/fa';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e']; // red, yellow, green

const ProgressDashboard = ({ groupId }) => {
    const { axiosInstance } = useAuth();
    const socket = useSocket();
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgress = async () => {
        try {
            const res = await axiosInstance.get(`/api/groups/${groupId}/tasks/progress`);
            const data = [
                { name: 'To Do', value: res.data['To Do'] },
                { name: 'In Progress', value: res.data['In Progress'] },
                { name: 'Done', value: res.data['Done'] }
            ];
            setProgressData(data);
        } catch (err) {
            setError("Failed to load progress data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchProgress();
        }
    }, [groupId]);

    // Re-fetch progress whenever tasks change
    useEffect(() => {
        if (!socket) return;
        const refresh = () => fetchProgress();
        socket.on('task:created', refresh);
        socket.on('task:updated', refresh);
        socket.on('task:deleted', refresh);
        return () => {
            socket.off('task:created', refresh);
            socket.off('task:updated', refresh);
            socket.off('task:deleted', refresh);
        };
    }, [socket]);

    if (loading) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center flex items-center justify-center h-full">
                <FaSpinner className="animate-spin text-indigo-400" size={30} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    const totalTasks = progressData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white text-center">
            <h2 className="text-2xl font-semibold mb-4">Group Progress</h2>
            {totalTasks === 0 ? (
                <p className="text-gray-400">No tasks to display progress.</p>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={progressData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {progressData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ProgressDashboard;
