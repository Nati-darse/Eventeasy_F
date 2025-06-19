import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/Event-Easy/Event/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setEvent(res.data);
      } catch (err) {
        console.error("Error fetching event:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) return <p className="text-center text-gray-500">Loading event...</p>;
  if (!event) return <p className="text-center text-red-500">Event not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl font-bold mb-4 text-center">{event.eventName}</h1>
      <p><strong>Category:</strong> {event.category}</p>
      <p><strong>Time:</strong> {new Date(event.time).toLocaleString()}</p>
      <p><strong>Description:</strong> {event.description || "No description"}</p>
      <p><strong>Pattern:</strong> {event.pattern}</p>
      <p><strong>Status:</strong> {event.status}</p>
      <p><strong>Organizer:</strong> {event.organizer?.name} ({event.organizer?.email || "no email"})</p>
      <p><strong>Venue ID:</strong> {event.venue_id}</p>
      <p><strong>Attendees:</strong> {event.attendees?.length || 0}</p>

      {/* Images/Videos if available */}
      {event.imageUrl?.url && (
        <img src={event.imageUrl.url} alt="Event" className="w-full mt-4 rounded-md" />
      )}
      {event.videoUrl?.url && (
        <video controls className="w-full mt-4 rounded-md">
          <source src={event.videoUrl.url} type="video/mp4" />
        </video>
      )}

      <Link
        to="/admin/event-management"
        className="block mt-6 text-center text-blue-600 hover:underline"
      >
        ⬅ Back to Events
      </Link>
    </div>
  );
};

export default EventDetail;
