const Event = require("../models/eventModel");
const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinary");

// Create new event
const createEvent = async (req, res) => { 
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const {
      eventName,
      time,
      category,
      pattern,
      description,
      updates,
      organizer,
      longitude, // 👈 from frontend
      latitude,  // 👈 from frontend
    } = req.body;

    const imageFile = req.files?.imageUrl?.[0];
    const videoFile = req.files?.videoUrl?.[0];

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    if (!imageFile) return res.status(400).json({ message: 'Image is required' });

    // Validate coordinates
    if (!longitude || !latitude) {
      return res.status(400).json({ message: "Location (longitude & latitude) is required" });
    }

    const imageData = {
      public_id: imageFile.filename,
      url: imageFile.path,
    };

    const videoData = videoFile
      ? {
          public_id: videoFile.filename,
          url: videoFile.path,
        }
      : null;

    const event = await Event.create({
      eventName,
      description,
      time,
      category,
      pattern,
      updates,
      imageUrl: imageData,
      videoUrl: videoData,
      attendees: [],
      organizer: userId,
      status: 'pending',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)], // 👈 Map-ready!
      },
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Failed to create event', error: err.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "name email")
      .populate("attendees", "name email");
      
    res.status(200).json(events);

  } catch (err) {
    console.error("❌ Error fetching events:", err.message);
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid event ID" });

  try {
    const event = await Event.findById(id)
      .populate("organizer", "name email") 
      .populate("attendees", "name email");

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ message: "Failed to fetch event", error: err.message });
  }
};

// Join event (attend)
const attendEvent = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // get from middleware!

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already registered' });
    }

    event.attendees.push(userId);
    await event.save();

    res.status(200).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cancel attendance
const leaveEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user?.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.attendees = event.attendees.filter(
      (attendeeId) => attendeeId.toString() !== userId
    );

    await event.save();
    res.status(200).json({ message: "Left event successfully", event });
  } catch (err) {
    console.error("Error leaving event:", err);
    res.status(500).json({ message: "Failed to leave event", error: err.message });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid event ID" });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const {
      eventName,
      time,
      category,
      pattern,
      description,
      updates,
      venue_id,
    } = req.body;

    // Upload image to Cloudinary if provided
    let imageUrl = event.imageUrl;
    if (req.files?.image) {
      const imageUpload = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: "event-images",
      });
      imageUrl = imageUpload.secure_url;
    }

    // Upload video to Cloudinary if provided
    let videoUrl = event.videoUrl;
    if (req.files?.video) {
      const videoUpload = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: "video",
        folder: "event-videos",
      });
      videoUrl = videoUpload.secure_url;
    }

    event.eventName = eventName || event.eventName;
    event.time = time || event.time;
    event.category = category || event.category;
    event.pattern = pattern || event.pattern;
    event.description = description || event.description;
    event.updates = updates || event.updates;
    event.venue_id = venue_id || event.venue_id;
    event.imageUrl = imageUrl;
    event.videoUrl = videoUrl;

    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (err) {
    console.error("❌ Error updating event:", err.message);
    res.status(500).json({ message: "Failed to update event", error: err.message });
  }
};

// Admin action to approve or reject an event
const updateEventStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expect status to be either 'approved' or 'rejected'

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid event ID" });

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Invalid status value. It should be 'approved' or 'rejected'." });
  }
  

  try {
    const event = await Event.findByIdAndUpdate(id, { status }, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: `Event status updated to ${status}`, event });
  } catch (err) {
    console.error("Error updating event status:", err);
    res.status(500).json({ message: "Failed to update event status", error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;
  console.error("Deleting event with ID:", id);

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid event ID" });

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Optionally, delete the image and video from Cloudinary
    if (event.imageUrl) {
      await cloudinary.uploader.destroy(event.imageUrl.public_id);
    }
    if (event.videoUrl) {
      await cloudinary.uploader.destroy(event.videoUrl.public_id, { resource_type: "video" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
}

// Get events created by the logged-in organizer
const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user.id;
    
    // Validate that the user is an organizer
    if (!organizerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const events = await Event.find({ organizer: organizerId })
      .sort({ createdAt: -1 })
      .populate("organizer", "name email")
      .populate("attendees", "name email");
    
    res.status(200).json({ success: true, events });
  } catch (err) {
    console.error("Error fetching organizer events:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch organizer events", 
      error: err.message 
    });
  }
};

// Get detailed attendee information for a specific event
const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }
    
    // Find the event and check if the requester is the organizer
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    if (event.organizer.toString() !== organizerId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: You can only view attendees for your own events" 
      });
    }
    
    // Get detailed attendee information
    const populatedEvent = await Event.findById(id)
      .populate({
        path: "attendees",
        select: "name email isVerified role createdAt"
      });
    
    if (!populatedEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      eventName: populatedEvent.eventName,
      attendees: populatedEvent.attendees,
      totalAttendees: populatedEvent.attendees.length
    });
  } catch (err) {
    console.error("Error fetching event attendees:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch event attendees", 
      error: err.message 
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  attendEvent,
  leaveEvent,
  updateEventStatus,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getEventAttendees
};