const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Access Denied. No token provided.",
      });
    }

    // Token format: Bearer <token>
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, "taskflowsecret");

    // Store user data in request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};

module.exports = authMiddleware;