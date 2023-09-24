import { jest } from "@jest/globals";
import fs from "fs";
import path from "path";
import StoreLogManager from "../../store/storeLogManager.js";
import StoreLog from "../../store/storeLog.js";
import { readLogFile, deleteFile } from "../../utils.js";

const logFilePath = "./tmp/test-storeLogManager.integration.log";

function _readLogFile() {
  return readLogFile(logFilePath);
}

describe("StoreLogManager Integration Test", () => {
  let manager;

  beforeAll(() => {
    deleteFile(logFilePath);
  });

  beforeEach(() => {
    manager = new StoreLogManager({
      logPath: logFilePath,
    });
  });

  afterEach(() => {
    deleteFile(logFilePath);
  });

  it("should save logs", () => {
    manager.save(new StoreLog("_set", ["key", "value"]));

    const logs = _readLogFile();
    expect(JSON.parse(logs[0])).toMatchObject({
      name: "_set",
      args: ["key", "value"],
    });
  });

  it("should flush logs to file", () => {
    manager.save(new StoreLog("_set", ["key", "value"]));
    manager.save(new StoreLog("_set", ["key2", "value2"]));

    const logs = _readLogFile();

    expect(logs).toHaveLength(2);

    expect(JSON.parse(logs[0])).toMatchObject({
      name: "_set",
      args: ["key", "value"],
    });
    expect(JSON.parse(logs[1])).toMatchObject({
      name: "_set",
      args: ["key2", "value2"],
    });
  });

  it("should compact logs", () => {
    // Assuming compaction removes redundant log entries
    manager.save(new StoreLog("_set", ["key", "value"]));
    manager.save(new StoreLog("delete", ["key"]));
    manager.save(new StoreLog("_set", ["key2", "value2"]));

    manager.compactLog();

    const logs = _readLogFile();
    expect(logs).toHaveLength(1);

    expect(JSON.parse(logs[0])).toMatchObject({
      name: "_set",
      args: ["key2", "value2"],
    });
  });

  it("should restore state from logs", () => {
    const mockStore = {
      _set: jest.fn(),
      rpush: jest.fn(),
      delete: jest.fn(),
    };

    manager.save(new StoreLog("_set", ["key", "value"]));
    manager.save(new StoreLog("delete", ["key"]));
    manager.save(new StoreLog("_set", ["key2", "value2"]));

    manager.restoreState(mockStore);

    // Verify actions on mockStore
    expect(mockStore._set).toHaveBeenCalledTimes(2);
    expect(mockStore.delete).toHaveBeenCalledTimes(1);

    // Verify logs content
    const logs = _readLogFile();
    expect(logs).toHaveLength(3);

    expect(JSON.parse(logs[0])).toMatchObject({
      name: "_set",
      args: ["key", "value"],
    });
    expect(JSON.parse(logs[1])).toMatchObject({
      name: "delete",
      args: ["key"],
    });
    expect(JSON.parse(logs[2])).toMatchObject({
      name: "_set",
      args: ["key2", "value2"],
    });
  });

  it("should check if log needs compaction", () => {
    manager.save(new StoreLog("_set", ["key", "value"]));
    manager.save(new StoreLog("delete", ["key"]));
    manager.save(new StoreLog("_set", ["key2", "value2"]));

    manager.checkForCompaction();

    // Assuming compaction keeps only the latest log entries (you may need to adjust based on your compaction logic)
    const logs = _readLogFile();
    expect(logs).toHaveLength(1);

    expect(JSON.parse(logs[0])).toMatchObject({
      name: "_set",
      args: ["key2", "value2"],
    });
  });

  describe("StoreLogManager Integration Test with Buffering", () => {
    const bufferSize = 3;

    beforeEach(() => {
      manager = new StoreLogManager({
        logPath: logFilePath,
        maxBufferSize: bufferSize,
      });
    });

    it("should save logs without flushing for buffer size less than max", () => {
      manager.save(new StoreLog("_set", ["key", "value"]));
      manager.save(new StoreLog("_set", ["key2", "value2"]));

      expect(manager.logBuffer.length).toBe(2);
      expect(_readLogFile()).toEqual([]); // The log file should be empty
    });

    it("should flush logs to file when buffer reaches max size", () => {
      manager.save(new StoreLog("_set", ["key", "value"]));
      manager.save(new StoreLog("_set", ["key2", "value2"]));
      manager.save(new StoreLog("_set", ["key3", "value3"]));

      const logs = _readLogFile();
      expect(logs).toHaveLength(bufferSize);

      expect(JSON.parse(logs[0])).toMatchObject({
        name: "_set",
        args: ["key", "value"],
      });
    });

    it("should handle subsequent logs after buffer is flushed", () => {
      manager.save(new StoreLog("_set", ["key", "value"]));
      manager.save(new StoreLog("_set", ["key2", "value2"]));
      manager.save(new StoreLog("_set", ["key3", "value3"]));
      manager.save(new StoreLog("_set", ["key4", "value4"]));

      const logs = _readLogFile();
      expect(logs).toHaveLength(bufferSize);

      expect(manager.logBuffer).toHaveLength(1);

      expect(JSON.parse(manager.logBuffer[0])).toMatchObject({
        name: "_set",
        args: ["key4", "value4"],
      });
    });
  });
});
