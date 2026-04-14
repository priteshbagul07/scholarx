require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const connectDB = require("./utils/db");
const { initSocket } = require("./utils/socket");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const lectureRoutes = require("./routes/lectures");
const assignmentRoutes = require("./routes/assignments");
const announcementRoutes = require("./routes/announcements");
const liveClassRoutes = require("./routes/liveClass");
const submissionRoutes = require("./routes/submissions");
const userRoutes = require("./routes/users");

const app = express();
const server = http.createServer(app);

connectDB();
initSocket(server);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/live", liveClassRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => res.json({ status: "Scholar X API is running" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Scholar X server running on port ${PORT}`);
});
