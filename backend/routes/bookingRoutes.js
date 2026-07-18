const express = require("express");
const router = express.Router();
const {
  createBooking,
  getQueueTicket,
  getClinicInfo,
} = require("../controllers/bookingController");

router.get("/clinic", getClinicInfo);
router.post("/bookings", createBooking);
router.get("/bookings/:id", getQueueTicket);

module.exports = router;
