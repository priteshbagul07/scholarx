const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const { submitAssignment, getMySubmissions } = require("../controllers/submissionController");
const upload = require("../utils/upload");

router.use(protect);

router.post(
  "/",
  requireRole("student"),
  (req, res, next) => { req.uploadType = "submissions"; next(); },
  upload.single("file"),
  submitAssignment
);
router.get("/mine", requireRole("student"), getMySubmissions);

module.exports = router;
