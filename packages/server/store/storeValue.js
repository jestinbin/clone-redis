class StoreValue {
  constructor(key, value, type) {
    this.key = key;
    this.value = value;
    this.type = type || this._determineType(value);
    this.queueListeners = [];
    this.fanoutListeners = [];
  }

  _determineType(value) {
    if (Array.isArray(value)) {
      return "array";
    }

    if (typeof value === "number" && Number.isInteger(value)) {
      return "integer";
    }

    return typeof value;
  }

  setKey(key) {
    this.key = key;
  }

  getKey() {
    return this.key;
  }

  setValue(value) {
    this.value = value;
    this.type = this._determineType(value); // Aggiorna il tipo ogni volta che il valore viene modificato
  }

  getValue() {
    return this.value;
  }

  getType() {
    return this.type;
  }
}

export default StoreValue;
