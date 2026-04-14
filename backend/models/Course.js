const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Course title is required"], trim: true },
    description: { type: String, default: "" },
    subject: { type: String, default: "" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8).toUpperCase() },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    coverColor: {
      type: String,
      default: () => ["#2563eb", "#7c3aed", "#059669", "#dc2626", "#d97706", "#0891b2"][Math.floor(Math.random() * 6)],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
