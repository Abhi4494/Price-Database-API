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
 *         name: series
 *         schema:
 *           type: string
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
 *     summary: Get Single Material Price List
 *     description: Fetch a single material by ID with optional filters, pagination, and sorting
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
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           description: Filter by region
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *           description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *           description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Search term across region, inco_term, unit_of_measurement, etc.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           description: Number of items per page
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [price_date, price, region, inco_term]
 *           default: price_date
 *           description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *           description: Sorting order
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



/**
 * @swagger
 * /material/price/view/{id}:
 *   get:
 *     summary: Price View 
 *     description: Fetch a Price of material by Price ID
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
 *         description: Material Price fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material Price not found
 *       500:
 *         description: Server error
 */
clientRoute.get('/price/view',apiLogger, apiKeyAuth, (req, res) => {
  return res.status(400).json({ message: 'Price ID is required' });
});
clientRoute.get('/price/view/:id',apiLogger,apiKeyAuth,ClientController.getPriceById);

module.exports = clientRoute;