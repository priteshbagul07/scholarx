const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const { startLiveClass, getActiveLiveClass, endLiveClass, getLiveClassHistory } = require("../controllers/liveClassController");

router.use(protect);

router.post("/start", requireRole("teacher"), startLiveClass);
router.get("/course/:courseId/active", getActiveLiveClass);
router.get("/course/:courseId/history", getLiveClassHistory);
router.patch("/:id/end", requireRole("teacher"), endLiveClass);

module.exports = router;
