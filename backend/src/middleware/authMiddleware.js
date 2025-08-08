import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "replace_this_with_env_secret";

// Protect any route – user must be logged in
export const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, isAdmin: decoded.isAdmin };
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

// Admin-only middleware – must be logged in AND isAdmin=true
export const admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};
