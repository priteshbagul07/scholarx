const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  createCourse,
  getTeacherCourses,
  getStudentCourses,
  joinCourse,
  getCourseById,
  updateCourse,
  removeStudent,
} = require("../controllers/courseController");

router.use(protect);

router.post("/", requireRole("teacher"), createCourse);
router.get("/my-courses", requireRole("teacher"), getTeacherCourses);
router.get("/enrolled", requireRole("student"), getStudentCourses);
router.post("/join", requireRole("student"), joinCourse);
router.get("/:id", getCourseById);
router.put("/:id", requireRole("teacher"), updateCourse);
router.delete("/:id/students/:studentId", requireRole("teacher"), removeStudent);

module.exports = router;
