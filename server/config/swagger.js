const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Price Database API",
      version: "1.0.0",
      description: "This API allows clients to manage and retrieve material pricing data",
    },
    servers: [
      {
        url: "http://localhost:4004/api/v1",
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",   // <-- Postman style
          description: "API key format: ApiKey <your_key>",
        },
      },
    },
  },
  apis: ["./server/routes/*.js"], // adjust path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
