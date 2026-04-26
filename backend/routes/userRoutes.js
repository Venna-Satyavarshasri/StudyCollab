import express from "express";
import rateLimit from "express-rate-limit";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  upload,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { message: "Too many registration attempts, please try again in an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", loginLimiter, authUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

router
  .route("/")
  .post(registerLimiter, registerUser)
  .get(protect, getAllUsers);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile);

export default router;
