import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./config/passport.js";
import axios from "axios";

// Routes
import portfolioRoutes from "./routes/portfolio.js";
import historyRoutes from "./routes/historyRoutes.js";
import authRoutes from "./routes/auth.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import digilockerRoutes from "./routes/digilocker.js";
import kycRoutes from "./routes/kyc.js";
import tradeRoutes from "./routes/trade.js";
import marketRoutes from "./routes/market.js";
import newsSignalRoute from "./routes/newsSignal.js";

import Prediction from "./models/Prediction.js";
import startFinnhub from "./services/finnhubService.js";

const app = express();

/* =====================================================
   CORS
===================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.log("❌ CORS BLOCKED:", origin);

      return callback(
        new Error(`CORS not allowed for origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =====================================================
   BODY PARSER
===================================================== */

app.use(express.json());

/* =====================================================
   SESSION
===================================================== */

app.use(
  session({
    secret: process.env.JWT_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

/* =====================================================
   PASSPORT
===================================================== */

app.use(passport.initialize());
app.use(passport.session());

/* =====================================================
   STATIC UPLOADS
===================================================== */

app.use("/uploads", express.static("uploads"));

/* =====================================================
   ROUTES
===================================================== */

app.use("/api/auth", authRoutes);

app.use("/api/auth", googleAuthRoutes);

app.use("/api/digilocker", digilockerRoutes);

app.use("/api/kyc", kycRoutes);

app.use("/api/trade", tradeRoutes);

app.use("/api/market", marketRoutes);

app.use("/api/portfolio", portfolioRoutes);

app.use("/api/history", historyRoutes);

app.use("/api/news-signal", newsSignalRoute);

/* =====================================================
   TEST ROUTES
===================================================== */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Trading System Backend is running ✅",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API WORKING 🚀",
  });
});

/* =====================================================
   AI PREDICTION
===================================================== */

app.get("/api/ai/predict/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const random = Math.random();

    let signal = "HOLD";

    if (random > 0.6) {
      signal = "BUY";
    } else if (random < 0.3) {
      signal = "SELL";
    }

    const prediction = {
      stock: symbol,
      signal,
      confidence: Math.floor(Math.random() * 100),
      price: 0,
      stop_loss: 0,
      target: 0,
      market_type: "SIDEWAYS",
    };

    const saved = await Prediction.create({
      symbol: prediction.stock,
      signal: prediction.signal,
      confidence: prediction.confidence,
      price: prediction.price,
      stop_loss: prediction.stop_loss,
      target: prediction.target,
      market_type: prediction.market_type,
    });

    res.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      success: false,
      error: "AI failed",
    });
  }
});

/* =====================================================
   HTTP SERVER
===================================================== */

const server = http.createServer(app);

/* =====================================================
   SOCKET.IO
===================================================== */

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      console.log("❌ SOCKET CORS BLOCKED:", origin);

      return callback(
        new Error(`Socket CORS not allowed for origin: ${origin}`)
      );
    },

    methods: [
      "GET",
      "POST",
    ],

    credentials: true,
  },
});

/* =====================================================
   FINNHUB WEBSOCKET
===================================================== */

startFinnhub(io);

/* =====================================================
   DATABASE
===================================================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `🚀 Server running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "❌ MongoDB Connection Error:",
      err
    );
  });