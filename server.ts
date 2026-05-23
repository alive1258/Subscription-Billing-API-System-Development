import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(
    `📚 Swagger documentation available at http://localhost:${PORT}/api-docs`,
  );
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info("Received shutdown signal, closing server...");
  server.close(() => {
    logger.info("Server closed successfully");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  gracefulShutdown();
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown();
});
