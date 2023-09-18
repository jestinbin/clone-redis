import { createLogger, format, transports } from "winston";

const isTest = process.env.NODE_ENV === "test";

const logger = createLogger({
  level: "info",
  silent: isTest,
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "app" },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    // TODO: create logs file based on service name
    new transports.File({ filename: `logs/error.log`, level: "error" }),
    new transports.File({ filename: `logs/combined.log` }),
  ],
});

function configLogger({ level, name }) {
  if (level) logger.level = level;
  if (name) logger.defaultMeta.service = name;
}

export { configLogger };

export default logger;
