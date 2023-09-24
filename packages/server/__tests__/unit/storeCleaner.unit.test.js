import { jest } from "@jest/globals";
import Store from "../../store/store.js";
import StoreCleaner from "../../store/storeCleaner.js";

jest.useFakeTimers();

describe("StoreCleaner", () => {
  let store, storeCleaner;

  beforeEach(() => {
    store = new Store();
    storeCleaner = new StoreCleaner({ store });
  });

  it("should cleanup expired keys", () => {
    store.set("key1", "value1", 1);
    jest.advanceTimersByTime(1500);
    storeCleaner.cleanup();
    expect(store.get("key1")).toBeUndefined();
  });

  it("should throw error if trying to start cleanup interval again", () => {
    storeCleaner.startCleanup();
    expect(() => storeCleaner.startCleanup()).toThrow(
      "Cleanup interval already started"
    );
  });

  it("should automatically cleanup expired keys in interval", () => {
    store.set("key1", "value1", 1);
    storeCleaner.startCleanup(1000);
    jest.advanceTimersByTime(2000);
    expect(store.get("key1")).toBeUndefined();
  });

  it("should stop cleanup interval", () => {
    storeCleaner.startCleanup();
    storeCleaner.stopCleanup();
    expect(storeCleaner.cleanupInterval).toBeNull();
  });
});
