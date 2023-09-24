import fs from "fs";
import logger, { configLogger } from "../../commons/logger.js";
import { deleteFile } from "../utils.js";

class StoreLogManager {
  constructor({
    logPath = "./tmp/commands.log",
    maxBufferSize = 1,
    compactThreshold = 50,
  } = {}) {
    this.logPath = logPath;
    this.maxBufferSize = maxBufferSize;
    this.compactThreshold = compactThreshold;
    this.logBuffer = [];
  }

  save(storeLog) {
    const log = JSON.stringify(storeLog);
    logger.debug(`[logger] save ${log}`);
    this.logBuffer.push(log);
    if (this.logBuffer.length >= this.maxBufferSize) {
      logger.debug(`[logger] flush`);
      this.flushBuffer();
    }
  }

  flushBuffer() {
    fs.appendFileSync(this.logPath, this.logBuffer.join("\n") + "\n");
    this.logBuffer = [];
  }

  /**
   * Compacts the log by applying the following rules:
   * 1. Possible commands to track are SET(key, value), DELETE(key), RPUSH(key, value).
   * 2. DELETE commands make preceding SET and RPUSH commands for the same key obsolete.
   * 3. In the log, values will be JSON serializations of a `storeValue` object.
   *
   * The logic works as follows:
   * - Reads the existing log.
   * - Iterates through the log from top to bottom.
   * - Maintains a map/object of keys seen so far.
   * - On encountering a DELETE command, removes that key from the map.
   * - On encountering a SET or RPUSH command, and if the key already exists in the map, updates it.
   * - At the end of the iteration, rewrites the log using only the relevant commands.
   */
  compactLog() {
    if (!fs.existsSync(this.logPath)) return;

    const commands = fs.readFileSync(this.logPath, "utf-8").split("\n");
    const keyMap = new Map();

    // iterate in reverse to retain the last relevant command for each key
    for (let i = 0; i < commands.length; i++) {
      const commandLine = commands[i];
      if (!commandLine) continue;

      const command = JSON.parse(commandLine);
      const { name, args, datetime } = command;
      const key = args[0];

      if (name === "delete") {
        keyMap.delete(key);
      } else if (name === "_set" || name === "rpush") {
        keyMap.set(key, commandLine);
      }
    }

    const compactedCommands = Array.from(keyMap.values());
    fs.writeFileSync(this.logPath, compactedCommands.join("\n") + "\n");
  }

  restoreState(store) {
    if (fs.existsSync(this.logPath)) {
      const content = fs.readFileSync(this.logPath, "utf-8");
      const logs = content.split("\n").filter((line) => line.trim() !== "");
      logs.forEach((commandStr) => {
        if (commandStr) {
          const command = JSON.parse(commandStr);
          store[command.name](...command.args, command.datetime);
        }
      });
    }
  }

  deleteLogs() {
    deleteFile(this.logPath);
  }

  checkForCompaction() {
    if (fs.statSync(this.logPath).size > this.compactThreshold) {
      this.compactLog();
    }
  }

  setupExitHandler() {
    logger.debug("store persistence: flush buffer");
    process.on("exit", this.flushBuffer.bind(this));
  }
}

export default StoreLogManager;
