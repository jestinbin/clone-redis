class StoreCleaner {
  constructor(store, keysToCheck = 1000) {
    this.store = store;
    this.keysToCheck = keysToCheck;
    this.cleanupInterval = null;
  }

  startCleanupInterval(intervalMs = 5000) {
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
      }
    }
  }
}

export default StoreCleaner;
