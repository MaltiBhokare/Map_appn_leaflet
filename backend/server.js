// Backend: server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

app.post("/calculate-metrics", (req, res) => {
  const { start, destination } = req.body;

  if (!start || !destination) {
    return res.status(400).json({ error: "Both locations are required" });
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(destination.lat - start.lat);
  const dLon = toRad(destination.lng - start.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(start.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  const area = Math.abs(start.lat - destination.lat) * Math.abs(start.lng - destination.lng);

  res.json({ area, distance });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
