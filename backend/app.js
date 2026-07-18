const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const bookingRoutes = require("./routes/bookingRoutes");
const queueRoutes = require("./routes/queueRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", bookingRoutes);
app.use("/api", queueRoutes);
app.use("/api", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
