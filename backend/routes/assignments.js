const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const {
  createAssignment,
  getAssignmentsByCourse,
  deleteAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} = require("../controllers/assignmentController");
const upload = require("../utils/upload");

router.use(protect);

router.post(
  "/",
  requireRole("teacher"),
  (req, res, next) => { req.uploadType = "assignments"; next(); },
  upload.single("file"),
  createAssignment
);
router.get("/course/:courseId", getAssignmentsByCourse);
router.delete("/:id", requireRole("teacher"), deleteAssignment);
router.get("/:id/submissions", requireRole("teacher"), getAssignmentSubmissions);
router.patch("/:id/submissions/:submissionId/grade", requireRole("teacher"), gradeSubmission);

module.exports = router;
