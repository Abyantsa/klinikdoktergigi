const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const { login } = require("../controllers/authController");
const {
  listSlots,
  upsertSlot,
  setSlotOpen,
} = require("../controllers/scheduleController");

router.post("/auth/login", login);

router.get("/slots", listSlots);
router.post("/slots", authMiddleware, upsertSlot);
router.patch("/slots/:id/open", authMiddleware, setSlotOpen);

module.exports = router;
