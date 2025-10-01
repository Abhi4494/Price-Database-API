require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../models");

const { SuperAdmin } = db;

const adminAuth = async function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        statusCode: 401,
        message: "Authorization header missing or malformed",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const existUser = await SuperAdmin.findByPk(decoded.user.id, {
      attributes: ["id", "name", "email", "mobile"],
    });

    if (!existUser) {
      return res.status(401).json({
        statusCode: 401,
        message: "Invalid token: user not found",
      });
    }

    req.user = existUser;
    next();
  } catch (err) {
    return res.status(401).json({
      statusCode: 401,
      message:
        err.name === "JsonWebTokenError"
          ? "Invalid token"
          : err.message || "Authentication failed",
    });
  }
};

module.exports = adminAuth;
