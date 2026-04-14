const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Assignment title is required"], trim: true },
    description: { type: String, default: "" },
    filePath: { type: String, default: "" },
    dueDate: { type: Date, required: [true, "Due date is required"] },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    maxMarks: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
