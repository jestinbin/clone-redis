import StoreValue from "./storeValue.js";
import Operation from "./../operation.js";
import config from "./../config.js";
import CustomError from "../../commons/customError.js";
import StoreLog from "./storeLog.js";
import { deleteFile } from "../utils.js";

/**
 * Note: The methods prefixed with an underscore (_) are used to process
 * internal information and return StoreValue. The equivalent methods without
 * the underscore prefix are the ones called from external sources.
 */

class Store {
  constructor({ logManager = null, resetPersistence = false } = {}) {
    this.data = new Map();
    this.expiryTimes = new Map();
    this.logManager = logManager;
    this.withPersistence = false;
    this.resetPersistence = resetPersistence;

    if (this.logManager) {
      if (this.resetPersistence) {
        this.logManager.deleteLogs();
      } else {
        this.logManager.compactLog();
        this.logManager.restoreState(this);
      }
      this.withPersistence = true;
    }
  }

  _set(key, value, seconds = undefined, dateNow = Date.now()) {
    if (this.withPersistence) {
      this.log("_set", [key, value, seconds]);
    }
    const storeValue = new StoreValue(key, value);
    this.data.set(key, storeValue);
    this.expiryTimes.delete(key);
    if (seconds !== undefined && seconds !== null) {
      this._expire(key, seconds, dateNow);
    }
    return storeValue;
  }

  set(key, value, seconds = undefined) {
    this._set(key, value, seconds);
    return true;
  }

  _get(key) {
    if (this.isExpired(key)) {
      this.delete(key);
      return undefined;
    }
    return this.data.get(key);
  }

  get(key) {
    const storeValue = this._get(key);
    return storeValue ? storeValue.value : undefined;
  }

  has(key) {
    if (this.isExpired(key)) {
      this.delete(key);
      return false;
    }
    return this.data.get(key) !== undefined;
  }

  delete(key) {
    if (this.withPersistence) {
      this.log("delete", [key]);
    }
    this.data.delete(key);
    this.expiryTimes.delete(key);
    return true;
  }

  _expire(key, seconds, dateNow = Date.now()) {
    if (seconds === -1) {
      // remove expiration
      this.expiryTimes.delete(key);
      return;
    }
    if (!this.isExpired(key)) {
      const expiryTime = dateNow + seconds * 1000;
      this.expiryTimes.set(key, expiryTime);
    }
    return true;
  }

  expire(key, seconds, dateNow = Date.now()) {
    if (this.withPersistence) {
      this.log("expire", [key, seconds]);
    }
    return this._expire(key, seconds, dateNow);
  }

  ttl(key, dateNow = Date.now()) {
    if (!this.expiryTimes.has(key)) {
      return -1; // no expiration
    }

    const remainingTime = this.expiryTimes.get(key) - dateNow;
    if (remainingTime <= 0) {
      this.delete(key);
      return -2; // key expired
    }

    return Math.ceil(remainingTime / 1000);
  }

  type(key) {
    const storeValue = this._get(key);
    return storeValue?.type || undefined;
  }

  rpush(key, value) {
    if (this.withPersistence) {
      this.log("rpush", [key, value]);
    }
    const storeValue = this._get(key);
    if (storeValue) {
      storeValue.value.push(value);
      if (storeValue.queueListeners.length !== 0) {
        const element = storeValue.value.shift();
        const outFn = storeValue.queueListeners.shift();
        outFn(element);
      }
    }
    return true;
  }

  blpop(key, outFn) {
    if (this.withPersistence) {
      this.log("blpop", [key]);
    }
    let storeValue = this._get(key);
    if (storeValue) {
      if (storeValue.type !== "array") {
        throw new Error(
          "blpop can be used only over array or undefined values"
        );
      }
      // value already present, no need to wait
      if (storeValue.value.length !== 0) {
        return storeValue.value.shift();
      }
    } else {
      // create StoreValue array
      storeValue = this._set(key, []);
    }
    // client will wait for a new value
    if (outFn) {
      storeValue.queueListeners.push((el) => outFn(el));
    }
    return new Operation(config.OPERATIONS.WAITING_FOR_RESPONSE);
  }

  publish(key, value) {
    let storeValue = this._get(key);
    if (!storeValue) {
      storeValue = new StoreValue(key, null, "pubsub");
      this.data.set(key, storeValue);
    } else if (storeValue.type !== "pubsub") {
      throw new CustomError("can't subscribe to a non-pubsub field");
    }
    storeValue.fanoutListeners.forEach((outFn) => outFn(value));
  }

  subscribe(key, outFn) {
    let storeValue = this._get(key);
    if (!storeValue) {
      storeValue = new StoreValue(key, null, "pubsub");
      this.data.set(key, storeValue);
    } else if (storeValue.type !== "pubsub") {
      throw new CustomError("can't subscribe to a non-pubsub field");
    }
    storeValue.fanoutListeners.push(outFn);
    return new Operation(config.OPERATIONS.NO_RESPONSE);
  }

  isExpired(key, dateNow = Date.now()) {
    const expiryTime = this.expiryTimes.get(key);
    if (!expiryTime) return false;
    return expiryTime <= dateNow;
  }

  log(name, args) {
    this.logManager?.save(new StoreLog(name, args));
  }
}

export default Store;
