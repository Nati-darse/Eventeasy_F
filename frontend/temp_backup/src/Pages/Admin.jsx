import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";

// Colors
const EVENT_COLORS = ["#34d399", "#facc15", "#f87171"];
const REPORT_COLORS = ["#facc15", "#10b981", "#ef4444"];

const Admin = () => {
  const [attendees, setAttendees] = useState(0);
  const [organizers, setOrganizers] = useState(0);
  const [eventStats, setEventStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [reportStats, setReportStats] = useState({
    pending: 12,
    resolved: 25,
    rejected: 3,
    avgResolveTime: 2.5,
    weekly: [5, 6, 3, 7, 4, 8, 2]
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchEventData();
    // Assume fetchReportStats() in real world
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/Event-Easy/users/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const users = res.data;
      setAttendees(users.filter(user => user.role === "attendee").length);
      setOrganizers(users.filter(user => user.role === "organizer").length);
    } catch (err) {
      console.error("User fetch failed:", err.message);
    }
  };

  const fetchEventData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/Event-Easy/Event/events");
      const events = res.data;
      setEventStats({
        total: events.length,
        approved: events.filter(e => e.status === "approved").length,
        pending: events.filter(e => e.status === "pending").length,
        rejected: events.filter(e => e.status === "rejected").length,
      });
    } catch (err) {
      console.error("Event fetch failed:", err.message);
    }
  };

  const eventData = [
    { name: "Approved", value: eventStats.approved },
    { name: "Pending", value: eventStats.pending },
    { name: "Rejected", value: eventStats.rejected },
  ];

  const reportStatusData = [
    { name: "Pending", value: reportStats.pending },
    { name: "Resolved", value: reportStats.resolved },
    { name: "Rejected", value: reportStats.rejected },
  ];

  const weeklyData = reportStats.weekly.map((val, idx) => ({
    name: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx],
    value: val
  }));

  return (
    <div className="relative p-6 bg-gradient-to-br from-slate-100 to-white min-h-screen overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-300 rounded-full blur-3xl opacity-30 animate-ping"></div>
      <div className="absolute bottom-10 -right-10 w-60 h-60 bg-blue-200 rounded-full blur-2xl opacity-40 animate-spin-slow"></div>

      {/* Header */}
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70 }}
        className="text-5xl font-extrabold text-center text-gray-800 mb-12 drop-shadow-xl"
      >
        Admin Control Center
      </motion.h1>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Total Events Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center"
        >
          <svg className="w-32 h-32">
            <circle cx="50%" cy="50%" r="48" stroke="#e5e7eb" strokeWidth="10" fill="none" />
            <motion.circle
              cx="50%" cy="50%" r="48"
              stroke="#8b5cf6" strokeWidth="10" fill="none"
              strokeDasharray={Math.PI * 2 * 48}
              strokeDashoffset={(1 - eventStats.total / 100) * Math.PI * 2 * 48}
              animate={{ strokeDashoffset: (1 - eventStats.total / 100) * Math.PI * 2 * 48 }}
              transition={{ duration: 1.5 }}
              strokeLinecap="round"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">Total Events</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">{eventStats.total}</p>
        </motion.div>

        {/* Attendees */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-blue-500 text-white text-3xl font-bold flex items-center justify-center animate-pulse">
            {attendees}
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">Attendees</h3>
        </motion.div>

        {/* Organizers */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center"
        >
          <svg viewBox="0 0 100 50" className="w-full h-24">
            <path d="M0,30 Q20,20 40,30 T80,10 L100,50 L0,50 Z" fill="rgba(16, 185, 129, 0.2)" />
            <path d="M0,30 Q20,20 40,30 T80,10" stroke="#10b981" fill="none" strokeWidth="2" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-600 mt-4">Organizers</h3>
          <p className="text-3xl font-bold text-emerald-500">{organizers}</p>
        </motion.div>
      </div>

      {/*  Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Report Status Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Report Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={reportStatusData}
                cx="50%" cy="50%"
                innerRadius={40} outerRadius={70}
                label dataKey="value"
              >
                {reportStatusData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={REPORT_COLORS[idx % REPORT_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Avg Resolve Time */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Avg. Resolve Time</h3>
          <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(reportStats.avgResolveTime / 5) * 100}%` }}
            />
          </div>
          <p className="text-md text-gray-600 mt-2">{reportStats.avgResolveTime} days</p>
        </div>

        {/* Weekly Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Reports This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="name" />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Status Pie */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-8 m-8 hover:shadow-2xl transition-all max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
          Event Status Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={eventData}
              cx="50%" cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {eventData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={EVENT_COLORS[idx % EVENT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="flex flex-wrap justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}     
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/admin/user-management")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg transition duration-300"
        >
          🛠️ Manage Users
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/admin/event-management")}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-lg transition duration-300"
        >
          📅 Manage Events
        </motion.button>
      </motion.div>

    </div>

  );
};

export default Admin;
