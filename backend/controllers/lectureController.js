const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const path = require("path");

const createLecture = async (req, res, next) => {
  try {
    const { title, description, type, videoUrl, courseId } = req.body;

    if (!title || !type || !courseId) {
      return res.status(400).json({ message: "Title, type, and courseId are required." });
    }

    const course = await Course.findOne({ _id: courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Course not found or access denied." });

    if (type === "url" && !videoUrl) {
      return res.status(400).json({ message: "Video URL is required for URL type lectures." });
    }

    if (type === "file" && !req.file) {
      return res.status(400).json({ message: "Video file is required for file type lectures." });
    }

    const lecture = await Lecture.create({
      title,
      description,
      type,
      videoUrl: type === "url" ? videoUrl : "",
      filePath: type === "file" ? `/uploads/lectures/${req.file.filename}` : "",
      courseId,
    });

    res.status(201).json(lecture);
  } catch (err) {
    next(err);
  }
};

const getLecturesByCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const isTeacher = course.teacherId.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: "Access denied." });
    }

    const lectures = await Lecture.find({ courseId: req.params.courseId }).sort("order createdAt");
    res.json(lectures);
  } catch (err) {
    next(err);
  }
};

const deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found." });

    const course = await Course.findOne({ _id: lecture.courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    await lecture.deleteOne();
    res.json({ message: "Lecture deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLecture, getLecturesByCourse, deleteLecture };
