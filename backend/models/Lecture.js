const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Lecture title is required"], trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["file", "url"], required: true },
    videoUrl: { type: String, default: "" },
    filePath: { type: String, default: "" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lecture", lectureSchema);
