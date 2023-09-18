import StoreValue from "./storeValue.js";

class Store {
  constructor() {
    this.data = new Map();
    this.expiryTimes = new Map();
  }

  set(key, value, seconds = undefined) {
    const storeValue = new StoreValue(key, value);
    this.data.set(key, storeValue);
    if (seconds !== undefined) {
      this.expire(ley, seconds);
    } else if (this.expiryTimes.has(key)) {
      this.expiryTimes.delete(key);
    }
    return true;
  }

  get(key) {
    if (this._isExpired(key)) {
      this.delete(key);
      return undefined;
    }
    const storeValue = this.data.get(key);
    return storeValue ? storeValue.value : undefined;
  }

  delete(key) {
    this.data.delete(key);
    this.expiryTimes.delete(key);
    return true;
  }

  expire(key, seconds) {
    if (seconds === -1) {
      // remove expiration
      this.expiryTimes.delete(key);
      return;
    }
    const expiryTime = Date.now() + seconds * 1000;
    this.expiryTimes.set(key, expiryTime);
    return true;
  }

  ttl(key) {
    if (!this.expiryTimes.has(key)) {
      return -1; // no expiration
    }

    const remainingTime = this.expiryTimes.get(key) - Date.now();
    if (remainingTime <= 0) {
      this.delete(key);
      return -2; // key expired
    }

    return Math.ceil(remainingTime / 1000);
  }

  type(key) {
    const value = this.get(key);
    return value?.type || undefined;
  }

  _isExpired(key) {
    const expiryTime = this.expiryTimes.get(key);
    if (!expiryTime) return false;
    return expiryTime <= Date.now();
  }
}

export default Store;
