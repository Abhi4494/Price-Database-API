const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Log folder path relative to project root
const logDir = path.join(__dirname, "../../public/logs");

// Make sure the folder exists
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logDir, "combined.log") }),
  ],
});

// Middleware to log API requests
const apiLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      client_id: req.client?.id || "unknown",
      method: req.method,
      endpoint: req.originalUrl,
      status_code: res.statusCode,
      response_time_ms: Date.now() - start,
      ip: req.ip,
      query: req.query,
      body: req.body,
    };

    // Separate error logs
    if (res.statusCode >= 400) {
      logger.error(logEntry);
    } else {
      logger.info(logEntry);
    }
  });

  next();
};

module.exports = { logger, apiLogger };
