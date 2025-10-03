const dotenv = require('dotenv');
dotenv.config();
const express = require("express");
const clientRoute = express.Router();

const ClientController = require("../Controller/Admin/ClientController");
const apiKeyAuth = require("../middlewares/clientAuth");
const { apiLogger } = require("../middlewares/logger");


/**
 * @swagger
 * /material/list:
 *   get:
 *     summary: Get Material List
 *     description: Fetch a paginated list of materials for the authenticated client
 *     tags:
 *       - Materials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: series
 *         schema:
 *           type: string
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Material list fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
clientRoute.get("/list",apiLogger, apiKeyAuth, ClientController.getAllMaterials);


/**
 * @swagger
 * /material/view/{id}:
 *   get:
 *     summary: Get Single Material
 *     description: Fetch a single material by ID
 *     tags:
 *       - Materials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Material fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
clientRoute.get('/view',apiLogger, apiKeyAuth, (req, res) => {
  return res.status(400).json({ message: 'material ID is required' });
});
clientRoute.get('/view/:id',apiLogger,apiKeyAuth,ClientController.getMaterialById);

module.exports = clientRoute;