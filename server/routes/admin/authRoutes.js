const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const authRouter = express.Router();
const AdminController = require("../../Controller/Admin/AdminController");
const ClientController = require("../../Controller/Admin/ClientController");
const adminAuth = require("../../middlewares/AdminAuth");

authRouter.post("/login", AdminController.login);
authRouter.get("/profile", adminAuth, AdminController.getProfile);

//Client
authRouter.get("/client/list", adminAuth, ClientController.getAllClients);
authRouter.post("/client/create", adminAuth, ClientController.createClient);

authRouter.post("/client/upload-data", adminAuth, ClientController.importMaterialPrice);


module.exports = authRouter;