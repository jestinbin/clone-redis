import logger from "./../../commons/logger.js";

class StoreCleaner {
  constructor(store, keysToCheck = 50) {
    this.store = store;
    this.keysToCheck = keysToCheck;
    this.cleanupInterval = null;
  }

  startCleanupInterval(intervalMs = 1000) {
    if (this.cleanupInterval) {
      throw new Error("Cleanup interval already started");
    }

    this.cleanupInterval = setInterval(() => this.cleanup(), intervalMs);
  }

  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  cleanup() {
    const keys = Array.from(this.store.expiryTimes.keys()).slice(
      0,
      this.keysToCheck
    );

    for (const key of keys) {
      if (this.store.isExpired(key)) {
        this.store.delete(key);
        logger.info(`delete expired key: ${key}`);
      }
    }
  }
}

export default StoreCleaner;
