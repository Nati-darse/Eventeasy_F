import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AttendeeEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:5000/Event-Easy/Event/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);

        // Decode userId from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;

        if (data.attendees && data.attendees.includes(userId)) {
          setAttending(true);
        }
      })
      .catch((error) => console.error('Error fetching event:', error));
  }, [id]);

  const handleRegister = () => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/Event-Easy/Event/events/${id}/attend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: 'attendeeUserId' }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setAttending(true);
          alert('Successfully registered for the event!');
        } else {
          alert('Registration failed');
        }
      })
      .catch((error) => console.error('Error registering:', error));
  };

  if (!event) {
    return <div className="text-center text-xl text-gray-500">Loading...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-10 px-6 flex justify-center items-start">
      <div className="max-w-4xl w-full space-y-8">

        {/* Organizer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={event.organizer.imageUrl || 'https://ui-avatars.com/api/?name=User'}
              alt="Organizer"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
            />
            <div>
              <p className="font-bold text-xl text-gray-900 dark:text-white">{event.organizer?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(event.time).toLocaleString()}</p>
            </div>
          </div>

          {/* Event Details */}
          <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-700 shadow-lg rounded-xl flex flex-col gap-4 mt-6">
            <h1 className="text-4xl font-bold text-center text-indigo-700 dark:text-indigo-300">{event.eventName}</h1>
            <p><strong className="font-medium">Category:</strong> {event.category}</p>
            <p><strong className="font-medium">Time:</strong> {new Date(event.time).toLocaleString()}</p>
            <p><strong className="font-medium">Description:</strong> {event.description || "No description"}</p>
            <p><strong className="font-medium">Pattern:</strong> {event.pattern}</p>
            <p><strong className="font-medium">Organizer:</strong> {event.organizer?.name} ({event.organizer?.email || "No email"})</p>
            <p><strong className="font-medium">Venue ID:</strong> {event.venue_id}</p>
            <p><strong className="font-medium">Attendees:</strong> {event.attendees?.length || 0}</p>
          </div>

          {/* Media Section (Vertical layout) */}
          {(event.imageUrl?.url || event.videoUrl?.url) && (
            <div className="flex flex-col gap-4 mt-6">
              {event.imageUrl?.url && (
                <img
                  src={event.imageUrl.url}
                  alt="Event"
                  className="rounded-xl object-cover border shadow-md"
                />
              )}
              {event.videoUrl?.url && (
                <video controls className="rounded-xl object-cover border shadow-md">
                  <source src={event.videoUrl.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {/* Registration Button */}
          <div className="pt-6 flex justify-center">
            {attending ? (
              <button className="px-6 py-3 rounded-full font-medium text-lg bg-gray-500 text-white cursor-not-allowed" disabled>
                Already Registered
              </button>
            ) : (
              <button
                onClick={handleRegister}
                className="px-6 py-3 rounded-full font-medium text-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Register for Event
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendeeEventPage;
