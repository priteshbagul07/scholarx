const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const liveClassSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    roomId: { type: String, default: () => uuidv4() },
    title: { type: String, default: "Live Class" },
    isActive: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    hostedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveClass", liveClassSchema);
