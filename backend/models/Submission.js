const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, default: "" },
    grade: { type: Number, default: null },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
