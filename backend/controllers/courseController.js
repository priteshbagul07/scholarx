const Course = require("../models/Course");
const User = require("../models/User");

const createCourse = async (req, res, next) => {
  try {
    const { title, description, subject } = req.body;

    if (!title) return res.status(400).json({ message: "Course title is required." });

    const course = await Course.create({
      title,
      description,
      subject,
      teacherId: req.user._id,
    });

    await course.populate("teacherId", "name email avatar");
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

const getTeacherCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ teacherId: req.user._id })
      .populate("teacherId", "name email avatar")
      .sort("-createdAt");
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const getStudentCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ students: req.user._id })
      .populate("teacherId", "name email avatar")
      .sort("-createdAt");
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const joinCourse = async (req, res, next) => {
  try {
    const { courseCode } = req.body;

    if (!courseCode) return res.status(400).json({ message: "Course code is required." });

    const course = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (!course) return res.status(404).json({ message: "Course not found. Check the code and try again." });

    if (course.students.includes(req.user._id)) {
      return res.status(409).json({ message: "You are already enrolled in this course." });
    }

    if (course.teacherId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot join your own course as a student." });
    }

    course.students.push(req.user._id);
    await course.save();
    await course.populate("teacherId", "name email avatar");

    res.json(course);
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacherId", "name email avatar")
      .populate("students", "name email avatar");

    if (!course) return res.status(404).json({ message: "Course not found." });

    const isTeacher = course.teacherId._id.toString() === req.user._id.toString();
    const isEnrolled = course.students.some((s) => s._id.toString() === req.user._id.toString());

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: "You do not have access to this course." });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!course) return res.status(404).json({ message: "Course not found." });

    const { title, description, subject } = req.body;
    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (subject !== undefined) course.subject = subject;

    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};

const removeStudent = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!course) return res.status(404).json({ message: "Course not found." });

    course.students = course.students.filter((s) => s.toString() !== req.params.studentId);
    await course.save();
    res.json({ message: "Student removed successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCourse, getTeacherCourses, getStudentCourses, joinCourse, getCourseById, updateCourse, removeStudent };
