import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      
      const res = await axios.get("http://localhost:5000/Event-Easy/Event/events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      

      setEvents(res.data);

    } catch (err) {
      console.error("Error fetching events:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (eventId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/Event-Easy/Event/events/${eventId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchEvents(); // refresh the list
    } catch (err) {
      console.error(`Failed to ${newStatus} event:`, err.message);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`http://localhost:5000/Event-Easy/Event/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvents(events.filter((ev) => ev._id !== eventId));
    } catch (err) {
      console.error("Failed to delete event:", err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🎪 Event Management</h1>


      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase tracking-wider">
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Organizer</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
             <tbody>
              {events.map((event) => (
                
                <tr key={event._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-6">{event.eventName}</td>
                  <td className="py-3 px-6">{event.organizer?.name || "N/A"}</td>
                  <td className="py-3 px-6 capitalize">{event.status}</td>
                  <td className="py-3 px-6 flex gap-4">
                    <button>
                      <Link
                    to={`/events/${event._id}`}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    View
                  </Link>
                    </button>
                    
                    <button
                      onClick={() => updateStatus(event._id, "approved")}
                      className  ="text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      onClick={() => updateStatus(event._id, "rejected")}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Reject"
                    >
                      <FaTimesCircle />
                    </button>
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    {/* Future button: Warn or Suspend Organizer */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
