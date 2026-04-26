import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer in-memory storage for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email and password");
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    if (!user.isEmailVerified) {
      res.status(401);
      throw new Error("Please verify your email before logging in");
    }

    const token = generateToken(user._id, user.name, user.email);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    res.status(400);
    throw new Error("Name must be between 2 and 50 characters");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }
  if (!password || password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const userExists = await User.findOne({ email: email.trim().toLowerCase() });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

  // Send email FIRST — only save user to DB if it succeeds
  await sendEmail({
    to: email,
    subject: "Verify your email – Study Planner",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f46e5;">Welcome to Collaborative Study Planner!</h2>
        <p>Hi ${name}, thanks for signing up. Please verify your email to get started.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a>
        <p style="color:#666;">This link expires in 24 hours.</p>
        <p style="color:#999;font-size:12px;">If you did not create this account, you can safely ignore this email.</p>
      </div>
    `,
  });

  // Email sent successfully — now save the user
  await User.create({
    name,
    email,
    password,
    avatar: `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(name)}&size=128`,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  res.status(201).json({ message: "Verification email sent. Please check your inbox." });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Update basic info
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Handle avatar upload if file is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "study-planner/avatars",
          resource_type: "auto",
        }
      );
      user.avatar = result.secure_url;
    }

    // Secure password update (require old password)
    if (req.body.password) {
      if (!req.body.oldPassword) {
        res.status(400);
        throw new Error("Old password required to set new password");
      }
      const passwordMatch = await user.matchPassword(req.body.oldPassword);
      if (!passwordMatch) {
        res.status(401);
        throw new Error("Old password is incorrect");
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      token: generateToken(
        updatedUser._id,
        updatedUser.name,
        updatedUser.email
      ),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin use case)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

// @desc    Verify email via token in link
// @route   GET /api/users/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification link");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ message: "Email verified successfully! You can now log in." });
});

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("No account found with that email");
  }

  if (user.isEmailVerified) {
    res.status(400);
    throw new Error("This email is already verified");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your email – Study Planner",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#4f46e5;">Verify your email</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a>
        <p style="color:#666;">This link expires in 24 hours.</p>
      </div>
    `,
  });

  res.json({ message: "Verification email resent. Please check your inbox." });
});

export { authUser, registerUser, getUserProfile, updateUserProfile, getAllUsers, upload, verifyEmail, resendVerificationEmail };

