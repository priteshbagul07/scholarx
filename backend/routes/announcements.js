const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const { createAnnouncement, getAnnouncementsByCourse, deleteAnnouncement } = require("../controllers/announcementController");

router.use(protect);

router.post("/", requireRole("teacher"), createAnnouncement);
router.get("/course/:courseId", getAnnouncementsByCourse);
router.delete("/:id", requireRole("teacher"), deleteAnnouncement);

module.exports = router;
