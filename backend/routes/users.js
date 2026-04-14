const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { updateProfile, changePassword } = require("../controllers/userController");
const upload = require("../utils/upload");

router.use(protect);

router.put(
  "/profile",
  (req, res, next) => { req.uploadType = "avatars"; next(); },
  upload.single("avatar"),
  updateProfile
);
router.put("/change-password", changePassword);

module.exports = router;
