const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: [true, "Announcement text is required"], trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
