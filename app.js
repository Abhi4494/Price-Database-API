const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require("cors");
const hostname = process.env.HOST || 'localhost';
const port = process.env.PORT || 4004;
const app = express() // setup express application
const adminAuth = require("./server/middlewares/AdminAuth");
const { apiLogger } = require("./server/middlewares/logger");
const setupSwagger = require("./server/config/swagger");
const server = http.createServer(app);
const path = require("path");
app.use(logger('dev')); // log requests to the console

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
// Use the logger **before all routes**
// app.use(apiLogger);

app.get('/',adminAuth, (req, res) => res.status(200).send({
message: 'Welcome to the default API route',
}));

const APIRouter = express.Router();
APIRouter.get("", (req, res) => {
  res.json({ message: "api is working !!" });
});
app.use("/api/v1", APIRouter);

const routers = require("./server/routes/routes");
app.use("/api/v1/admin", routers.authRouter);
app.use("/api/v1/material", routers.clientRoute);


setupSwagger(app);

server.listen(port, hostname, () => {
console.log(`Server running at http://${hostname}:${port}/`);
});