// ─── JWT Authentication Middleware ───────────────────────────────────────────
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const JWT_SECRET = process.env.JWT_SECRET || "renova-dev-secret";

/**
 * Generate a JWT token for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

/**
 * Verify JWT token from Authorization header
 * Attaches req.user = { id, email, name }
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required. Provide a Bearer token." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Optionally verify user still exists in DB
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please sign in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    return res.status(500).json({ error: "Authentication failed." });
  }
}

/**
 * Optional auth — attaches req.user if token present, but doesn't block
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { generateToken, authenticate, optionalAuth };
