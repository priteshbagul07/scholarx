const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId) return res.status(400).json({ message: "Assignment ID is required." });
    if (!req.file) return res.status(400).json({ message: "Submission file is required." });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    const course = await Course.findById(assignment.courseId);
    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ message: "You are not enrolled in this course." });
    }

    const existing = await Submission.findOne({ studentId: req.user._id, assignmentId });
    if (existing) {
      existing.filePath = `/uploads/submissions/${req.file.filename}`;
      existing.fileName = req.file.originalname;
      existing.submittedAt = new Date();
      await existing.save();
      return res.json(existing);
    }

    const submission = await Submission.create({
      studentId: req.user._id,
      assignmentId,
      filePath: `/uploads/submissions/${req.file.filename}`,
      fileName: req.file.originalname,
    });

    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate("assignmentId", "title dueDate maxMarks courseId");
    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

module.exports = { submitAssignment, getMySubmissions };
