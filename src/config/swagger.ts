import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Subscription & Billing API",
      version: "1.0.0",
      description:
        "API for managing client subscriptions with payment integration",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            isEmailVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Plan: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            duration: { type: "number" },
            features: { type: "array", items: { type: "string" } },
            isActive: { type: "boolean" },
          },
        },
        Subscription: {
          type: "object",
          properties: {
            id: { type: "string" },
            planId: { type: "string" },
            planName: { type: "string" },
            price: { type: "number" },
            expiryDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["active", "expired", "cancelled", "pending"],
            },
            autoRenew: { type: "boolean" },
            transactionId: { type: "string" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

export default swaggerJsdoc(options);
