import fs from "fs";

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

export function deleteFile(logFilePath) {
  if (fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
  }
}
