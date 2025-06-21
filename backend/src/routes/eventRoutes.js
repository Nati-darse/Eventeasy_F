const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth"); // Assume this middleware checks if a user is authenticated
const {
  createEvent,
  getAllEvents,
  getEventById,
  attendEvent,
  leaveEvent,
  updateEventStatus,
  updateEvent,
  deleteEvent
} = require("../controllers/eventController");

const upload = require("../middlewares/multer");

router.post(
  "/createEvents",
  upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
  ]),
  userAuth,
  createEvent
)

router.get("/events", getAllEvents);

router.get("/events/:id", getEventById);

router.post("/events/:id/attend", userAuth, attendEvent);

router.get("/events/:id", userAuth, getEventById);

router.put("/events/:id/status", userAuth, updateEventStatus);

router.put("/events/:id", userAuth, updateEvent);

router.delete("/events/:id", userAuth, deleteEvent);

module.exports = router;