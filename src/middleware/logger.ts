import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  // Log request
  logger.debug(`Incoming ${req.method} ${req.url}`);

  // Capture response
  const oldJson = res.json;
  res.json = function (data: any) {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    return oldJson.call(this, data);
  };

  next();
};

export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error(`Error on ${req.method} ${req.url}:`, {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next(err);
};
