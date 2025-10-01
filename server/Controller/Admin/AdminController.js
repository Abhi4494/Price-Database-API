const db = require("../../models");
const { Sequelize, SuperAdmin } = db;
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({
        statusCode: 400,
        message: "Please provide email address",
      });
    }

    if (!password) {
      return res.status(400).send({
        statusCode: 400,
        message: "Please provide password",
      });
    }

    const adminUser = await SuperAdmin.findOne({ where: { email } });

    if (!adminUser) {
      return res.status(404).send({
        statusCode: 404,
        message: "Provided email address not found. Please enter correct email address",
      });
    }

    const match = await bcrypt.compare(password, adminUser.password);

    if (!match) {
      return res.status(401).send({
        statusCode: 401,
        message: "Provided password does not match. Please enter correct password",
      });
    }

    const payload = {
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
      },
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "2h" });

    return res.status(200).send({
      statusCode: 200,
      message: "Admin login successful",
      token,
      admin_user_info: payload.user,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const superAdminID = req.user.id;

    const get_admin_profile = await SuperAdmin.findOne({
      where: { id: superAdminID },
      attributes: ["id", "name", "email", "mobile"],
    });

    return res.status(200).send({
      statusCode: 200,
      message: "Super Admin Profile.",
      data: get_admin_profile,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  getProfile
};
