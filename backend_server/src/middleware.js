const jwt = require("jsonwebtoken");
const { secret_key } = require("../src/controller/auths");
const checkIfAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No token provided", success: false });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided", success: false });
  }
  const verifytoken = jwt.verify(token, secret_key);
  if (!verifytoken) {
    return res.status(403).json({ message: "Invalid token", success: false });
  }

  req.user = verifytoken.user;
  console.log(req.user, "helloooo");
  next();
};
module.exports = checkIfAuthenticated;
