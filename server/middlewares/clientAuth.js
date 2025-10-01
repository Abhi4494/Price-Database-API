// src/middleware/apiKeyAuth.js
const db = require("../models");
const { Client } = db;

const apiKeyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const apiKey = authHeader?.split(" ")[1]; // "ApiKey <key>"

    if (!apiKey) {
      return res.status(401).json({ message: "API key required" });
    }

    const client = await Client.findOne({ where: { apiKey:apiKey } });
    if (!client) {
      return res.status(403).json({ message: "Invalid API key" });
    }
    if(client.is_active === false){
      return res.status(403).json({ message: "Client is not active. Please contact admin." });
    }
    
    req.client = client; // attach client info
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

module.exports = apiKeyAuth;
