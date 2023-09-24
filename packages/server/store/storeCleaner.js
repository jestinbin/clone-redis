import logger from "./../../commons/logger.js";

class StoreCleaner {
  constructor({
    store,
    keysToCheck = 50,
    intervalMs = 1000,
    start = false,
  } = {}) {
    this.store = store;
    this.keysToCheck = keysToCheck;
    this.intervalMs = intervalMs;
    this.cleanupInterval = null;
    if (start) {
      this.startCleanup();
    }
  }

  startCleanup() {
    if (this.cleanupInterval) {
      throw new Error("Cleanup interval already started");
    }
    this.cleanupInterval = setInterval(() => this.cleanup(), this.intervalMs);
  }

  stopCleanup() {
    logger.debug(`store stop cleanup`);
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
