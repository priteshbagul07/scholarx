const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Submission = require("../models/Submission");

const createAssignment = async (req, res, next) => {
  try {
    const { title, description, dueDate, courseId, maxMarks } = req.body;

    if (!title || !dueDate || !courseId) {
      return res.status(400).json({ message: "Title, due date, and courseId are required." });
    }

    const course = await Course.findOne({ _id: courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Course not found or access denied." });

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      courseId,
      maxMarks: maxMarks || 100,
      filePath: req.file ? `/uploads/assignments/${req.file.filename}` : "",
    });

    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
};

const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const isTeacher = course.teacherId.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: "Access denied." });
    }

    const assignments = await Assignment.find({ courseId: req.params.courseId }).sort("-createdAt");

    if (req.user.role === "student") {
      const assignmentIds = assignments.map((a) => a._id);
      const submissions = await Submission.find({
        studentId: req.user._id,
        assignmentId: { $in: assignmentIds },
      });

      const submissionMap = {};
      submissions.forEach((s) => { submissionMap[s.assignmentId.toString()] = s; });

      const enriched = assignments.map((a) => ({
        ...a.toObject(),
        submission: submissionMap[a._id.toString()] || null,
      }));

      return res.json(enriched);
    }

    res.json(assignments);
  } catch (err) {
    next(err);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    const course = await Course.findOne({ _id: assignment.courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted." });
  } catch (err) {
    next(err);
  }
};

const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found." });

    const course = await Course.findOne({ _id: assignment.courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate("studentId", "name email avatar");

    res.json(submissions);
  } catch (err) {
    next(err);
  }
};

const gradeSubmission = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found." });

    const assignment = await Assignment.findById(submission.assignmentId);
    const course = await Course.findOne({ _id: assignment.courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    submission.grade = grade;
    submission.feedback = feedback || "";
    await submission.save();

    res.json(submission);
  } catch (err) {
    next(err);
  }
};

module.exports = { createAssignment, getAssignmentsByCourse, deleteAssignment, getAssignmentSubmissions, gradeSubmission };
