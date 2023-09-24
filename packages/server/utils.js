import fs from "fs";
import path from "path";

export function readLogFile(logFilePath) {
  if (fs.existsSync(logFilePath)) {
    const content = fs.readFileSync(logFilePath, "utf-8");
    const logs = content.split("\n").filter((line) => line.trim() !== "");
    return logs;
  } else {
    return [];
  }
}

export function checkRequiredArg(value, argName) {
  if (value === undefined) {
    throw new Error(
      `The value for "${argName}" is required and cannot be undefined.`
    );
  }
}

export function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function checkOrCreateFilePath(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
