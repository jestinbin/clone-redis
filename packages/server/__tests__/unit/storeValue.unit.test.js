import StoreValue from "../../store/storeValue.js";

describe("StoreValue", () => {
  it("should correctly set and get the key", () => {
    const storeValue = new StoreValue("key1", "value1");
    expect(storeValue.getKey()).toBe("key1");

    storeValue.setKey("key2");
    expect(storeValue.getKey()).toBe("key2");
  });

  it("should correctly set and get the value", () => {
    const storeValue = new StoreValue("key1", "value1");
    expect(storeValue.getValue()).toBe("value1");

    storeValue.setValue("value2");
    expect(storeValue.getValue()).toBe("value2");
  });

  it("should determine type as array", () => {
    const storeValue = new StoreValue("key1", []);
    expect(storeValue.getType()).toBe("array");
  });

  it("should determine type as integer", () => {
    const storeValue = new StoreValue("key1", 123);
    expect(storeValue.getType()).toBe("integer");
  });

  it("should determine type as string", () => {
    const storeValue = new StoreValue("key1", "string");
    expect(storeValue.getType()).toBe("string");
  });

  it("should update type when value is modified", () => {
    const storeValue = new StoreValue("key1", "string");
    storeValue.setValue(456);
    expect(storeValue.getType()).toBe("integer");
  });
});
