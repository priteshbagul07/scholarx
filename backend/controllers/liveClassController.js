const LiveClass = require("../models/LiveClass");
const Course = require("../models/Course");

const startLiveClass = async (req, res, next) => {
  try {
    const { courseId, title } = req.body;

    if (!courseId) return res.status(400).json({ message: "courseId is required." });

    const course = await Course.findOne({ _id: courseId, teacherId: req.user._id });
    if (!course) return res.status(403).json({ message: "Access denied." });

    await LiveClass.updateMany({ courseId, isActive: true }, { isActive: false, endedAt: new Date() });

    const liveClass = await LiveClass.create({
      courseId,
      title: title || `${course.title} - Live Class`,
      hostedBy: req.user._id,
    });

    res.status(201).json(liveClass);
  } catch (err) {
    next(err);
  }
};

const getActiveLiveClass = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const isTeacher = course.teacherId.toString() === req.user._id.toString();
    const isEnrolled = course.students.includes(req.user._id);

    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ message: "Access denied." });
    }

    const liveClass = await LiveClass.findOne({ courseId: req.params.courseId, isActive: true })
      .populate("hostedBy", "name avatar");

    if (!liveClass) return res.status(404).json({ message: "No active live class." });

    res.json(liveClass);
  } catch (err) {
    next(err);
  }
};

const endLiveClass = async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findOne({ _id: req.params.id, hostedBy: req.user._id });
    if (!liveClass) return res.status(404).json({ message: "Live class not found." });

    liveClass.isActive = false;
    liveClass.endedAt = new Date();
    await liveClass.save();

    res.json({ message: "Live class ended." });
  } catch (err) {
    next(err);
  }
};

const getLiveClassHistory = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found." });

    const history = await LiveClass.find({ courseId: req.params.courseId })
      .populate("hostedBy", "name avatar")
      .sort("-createdAt")
      .limit(10);

    res.json(history);
  } catch (err) {
    next(err);
  }
};

module.exports = { startLiveClass, getActiveLiveClass, endLiveClass, getLiveClassHistory };
