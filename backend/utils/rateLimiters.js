import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 300,
  //   keyGenerator: (req) => req.user?._id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again in a few minutes.",
    });
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min,
  max: 30,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  },
});
