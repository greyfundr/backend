const jwt = require("jsonwebtoken");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "Invalid token format" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: "Invalid or expired token" });
      }

      req.user = decoded.user;

      next();
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};
