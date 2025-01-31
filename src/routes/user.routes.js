import { Router } from "express";
import {
  registerUser, loginUser, logoutUser
  , refreshAccessToken, chnageCurrentPassword,
  getCureentUser, updateUserDetails, updateUserAvatar,
  updateUserCoverImage, getUserChannelProfile,
  getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  (err, req, res, next) => {
    if (err) {
      return res.status(400).send("error while regitering user ", err.message);
    }
    next();
  },
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshToken").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, chnageCurrentPassword)
router.route("/cureent-user").get(verifyJWT, getCureentUser)
router.route("/update-details").patch(verifyJWT, updateUserDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/coverimage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT , getWatchHistory)
export default router;