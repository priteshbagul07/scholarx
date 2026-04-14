const Announcement = require("../models/Announcement");
const Course = require("../models/Course");

const createAnnouncement = async (req, res, next) => {
  try {
    const { text, courseId } = req.body;

    if (!text || !courseId) {
      return res.status(400).json({ message: "Text and courseId are required." });
    }

    const course = await Course.findOne({ _id: courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    const announcement = await Announcement.create({
      text,
      courseId,
      authorId: req.user._id,
    });

    await announcement.populate("authorId", "name avatar");
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
};

const getAnnouncementsByCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const isTeacher = course.teacherId.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: "Access denied." });
    }

    const announcements = await Announcement.find({ courseId: req.params.courseId })
      .populate("authorId", "name avatar")
      .sort("-createdAt");

    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });

    const course = await Course.findOne({ _id: announcement.courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = { createAnnouncement, getAnnouncementsByCourse, deleteAnnouncement };
