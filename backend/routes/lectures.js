const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const { createLecture, getLecturesByCourse, deleteLecture } = require("../controllers/lectureController");
const upload = require("../utils/upload");

router.use(protect);

router.post(
  "/",
  requireRole("teacher"),
  (req, res, next) => { req.uploadType = "lectures"; next(); },
  upload.single("video"),
  createLecture
);
router.get("/course/:courseId", getLecturesByCourse);
router.delete("/:id", requireRole("teacher"), deleteLecture);

module.exports = router;
