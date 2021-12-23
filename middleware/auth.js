const jwt = require("jsonwebtoken");
const config = process.env;
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  var token =
    req.body.token ||
    req.query.token ||
    req.headers["access-token"] ||
    req.headers["Token"];
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7, authHeader.length);
  } else {
    return res.status(401).json({ message: "Invalid Token provided" });
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "A token is required for authentication" });
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
  return next();
};

module.exports = verifyToken;
