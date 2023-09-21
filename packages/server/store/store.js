import StoreValue from "./storeValue.js";
import Operation from "./../operation.js";
import config from "./../config.js";
import CustomError from "../../commons/customError.js";

class Store {
  constructor() {
    this.data = new Map();
    this.expiryTimes = new Map();
  }

  _set(key, value, seconds = undefined) {
    const storeValue = new StoreValue(key, value);
    this.data.set(key, storeValue);
    if (seconds !== undefined && seconds !== null) {
      this.expire(key, seconds);
    } else if (this.expiryTimes.has(key)) {
      this.expiryTimes.delete(key);
    }
    return storeValue;
  }

  set(key, value, seconds = undefined) {
    this._set(key, value, seconds);
    return true;
  }

  _get(key) {
    if (this._isExpired(key)) {
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
    if (this._isExpired(key)) {
      this.delete(key);
      return false;
    }
    return this.data.get(key) !== undefined;
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
    const storeValue = this._get(key);
    return storeValue?.type || undefined;
  }

  rpush(key, value) {
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
    storeValue.queueListeners.push((el) => outFn(el));
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

  _isExpired(key) {
    const expiryTime = this.expiryTimes.get(key);
    if (!expiryTime) return false;
    return expiryTime <= Date.now();
  }
}

export default Store;
