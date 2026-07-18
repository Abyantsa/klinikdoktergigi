const express = require("express");
const router = express.Router();
const {
  listQueue,
  callNext,
  skipPatient,
  recallPatient,
  completePatient,
  getReport,
} = require("../controllers/queueController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/queue", listQueue);
router.get("/queue/report", authMiddleware, getReport);

router.post("/queue/call-next", authMiddleware, callNext);
router.post("/queue/skip/:id", authMiddleware, skipPatient);
router.post("/queue/recall/:id", authMiddleware, recallPatient);
router.post("/queue/complete/:id", authMiddleware, completePatient);

module.exports = router;
