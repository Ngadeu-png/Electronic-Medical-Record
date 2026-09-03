const express = require("express");
const {
  login,
  signup,
  resetPassword,
  getPatients,
} = require("../controller/auths");

const authsRoute = express.Router();

authsRoute.post("/login", login);
authsRoute.post("/signup", signup);
authsRoute.patch("/resetpassword", resetPassword);
authsRoute.get("/", getPatients);

module.exports = authsRoute;
