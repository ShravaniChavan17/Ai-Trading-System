import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTP } from "../utils/sendEmail.js";
import passport from "../config/passport.js";

const router = express.Router();

/* =====================================================
   HELPER
===================================================== */

const normalizeEmail = (email) => {
  return String(email || "").toLowerCase().trim();
};

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

/* =====================================================
   SIGNUP
===================================================== */

router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    /* -----------------------------------------------
       CHECK DUPLICATE EMAIL
    ------------------------------------------------ */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please login.",
      });
    }

    /* -----------------------------------------------
       CREATE USER
    ------------------------------------------------ */

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const user = new User({
      name: fullName,
      email: normalizedEmail,
      password,
      isVerified: false,
    });

    /* -----------------------------------------------
       GENERATE OTP
    ------------------------------------------------ */

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;
    user.otpExpiry =
      Date.now() + 5 * 60 * 1000;

    await user.save();

    /* -----------------------------------------------
       SEND OTP
    ------------------------------------------------ */

    await sendOTP(normalizedEmail, otp);

    console.log(
      "✅ SIGNUP SUCCESS:",
      normalizedEmail
    );

    res.status(201).json({
      success: true,
      message: "Signup successful. OTP sent.",
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);

    /* -----------------------------------------------
       HANDLE MONGODB DUPLICATE KEY
    ------------------------------------------------ */

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please login.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Signup failed. Please try again.",
    });
  }
});

/* =====================================================
   REQUEST OTP
===================================================== */

router.post("/request-otp", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(
      req.body.email
    );

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    let user = await User.findOne({
      email: normalizedEmail,
    });

    /* -----------------------------------------------
       CREATE USER IF NOT EXISTS
    ------------------------------------------------ */

    if (!user) {
      user = new User({
        email: normalizedEmail,
        isVerified: false,
      });
    }

    /* -----------------------------------------------
       GENERATE OTP
    ------------------------------------------------ */

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.otp = otp;
    user.otpExpiry =
      Date.now() + 5 * 60 * 1000;

    await user.save();

    /* -----------------------------------------------
       SEND OTP
    ------------------------------------------------ */

    await sendOTP(normalizedEmail, otp);

    console.log(
      "✅ OTP EMAIL SENT:",
      normalizedEmail
    );

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("REQUEST OTP ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/* =====================================================
   VERIFY OTP
===================================================== */

router.post("/verify-otp", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(
      req.body.email
    );

    const { otp } = req.body;

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    /* -----------------------------------------------
       CHECK OTP
    ------------------------------------------------ */

    if (!user.otp || user.otp !== String(otp)) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    /* -----------------------------------------------
       CHECK EXPIRY
    ------------------------------------------------ */

    if (
      !user.otpExpiry ||
      Date.now() > user.otpExpiry
    ) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    /* -----------------------------------------------
       VERIFY USER
    ------------------------------------------------ */

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully",
      isPinSet: !!user.pin,
      kycCompleted:
        user.kycCompleted || false,
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});

/* =====================================================
   SET PIN
===================================================== */

router.post("/set-pin", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(
      req.body.email
    );

    const { pin } = req.body;

    if (!normalizedEmail || !pin) {
      return res.status(400).json({
        success: false,
        message: "Email and PIN are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    user.pin = String(pin);

    await user.save();

    return res.json({
      success: true,
      message: "PIN set successfully",
    });

  } catch (err) {
    console.error("SET PIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to set PIN",
    });
  }
});

/* =====================================================
   VERIFY PIN
===================================================== */

router.post("/verify-pin", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(
      req.body.email
    );

    const { pin } = req.body;

    if (!normalizedEmail || !pin) {
      return res.status(400).json({
        success: false,
        message: "Email and PIN are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (
      !user ||
      user.pin !== String(pin)
    ) {
      return res.json({
        success: false,
        message: "Invalid PIN",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      message: "PIN verified successfully",
      token,
      userId: user._id,
    });

  } catch (err) {
    console.error("VERIFY PIN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "PIN verification failed",
    });
  }
});

/* =====================================================
   COMPLETE KYC
===================================================== */

router.post("/complete-kyc", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(
      req.body.email
    );

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    user.kycCompleted = true;

    await user.save();

    return res.json({
      success: true,
      message: "KYC completed successfully",
    });

  } catch (err) {
    console.error("COMPLETE KYC ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to complete KYC",
    });
  }
});

/* =====================================================
   GET USER
===================================================== */

router.post("/get-user", async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(
      req.body.email
    );

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      isVerified:
        user.isVerified || false,
      isPinSet: !!user.pin,
      kycCompleted:
        user.kycCompleted || false,
      name: user.name,
      wallet: user.wallet || 0,
      email: user.email,
    });

  } catch (err) {
    console.error("GET USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

/* =====================================================
   GET CURRENT USER
===================================================== */

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("GET CURRENT USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
});

/* =====================================================
   GOOGLE AUTH
===================================================== */

/* Start Google Login */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/* Google Callback */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      "https://ai-trading-system-q6t5.vercel.app/login",
  }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user || !user.email) {
        return res.redirect(
          "https://ai-trading-system-q6t5.vercel.app/login"
        );
      }

      const redirectURL =
        `https://ai-trading-system-q6t5.vercel.app/auth-success?email=${encodeURIComponent(
          user.email
        )}`;

      return res.redirect(redirectURL);

    } catch (err) {
      console.error(
        "GOOGLE CALLBACK ERROR:",
        err
      );

      return res.redirect(
        "https://ai-trading-system-q6t5.vercel.app/login"
      );
    }
  }
);

export default router;