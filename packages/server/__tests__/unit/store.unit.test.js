import { jest } from "@jest/globals";
import Store from "../../store/store.js";
import StoreValue from "../../store/storeValue.js";
import Operation from "../../operation";
import config from "./../../config";
import CustomError from "./../../../commons/customError.js";

jest.useFakeTimers();

describe("Store", () => {
  let store;

  beforeEach(() => {
    store = new Store();
  });

  it("should set and get a value", () => {
    store.set("key1", "value1");
    expect(store.get("key1")).toBe("value1");
  });

  it("should delete a value", () => {
    store.set("key1", "value1");
    store.delete("key1");
    expect(store.get("key1")).toBeUndefined();
  });

  it("should set an expiration and remove the key after expiration", () => {
    store.set("key1", "value1", 1);
    expect(store.get("key1")).toBe("value1");

    jest.advanceTimersByTime(1500);

    expect(store.get("key1")).toBeUndefined();
  });

  it("should handle rpush and blpop correctly", () => {
    store.rpush("key1", "value1");
    const result = store.blpop("key1", (val) => val);
    expect(result).toEqual(
      new Operation(config.OPERATIONS.WAITING_FOR_RESPONSE)
    );
  });

  it("should throw error on blpop for non-array values", () => {
    store.set("key1", "value1");
    expect(() => store.blpop("key1", () => {})).toThrow(
      "blpop can be used only over array or undefined values"
    );
  });

  it("should handle publish and subscribe correctly for new key", () => {
    const mockFn = jest.fn();
    store.subscribe("channel1", mockFn);

    store.publish("channel1", "message1");
    expect(mockFn).toHaveBeenCalledWith("message1");
  });

  it("should handle publish and subscribe correctly for existing non-pubsub key", () => {
    store.set("key1", "value1");
    expect(() => store.subscribe("key1", jest.fn())).toThrow(
      new CustomError("can't subscribe to a non-pubsub field")
    );
  });

  it("should handle multiple subscribers", () => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();

    store.subscribe("channel1", mockFn1);
    store.subscribe("channel1", mockFn2);

    store.publish("channel1", "message1");
    expect(mockFn1).toHaveBeenCalledWith("message1");
    expect(mockFn2).toHaveBeenCalledWith("message1");
  });

  it("should not notify subscribers when publishing to a non-existent channel", () => {
    const mockFn = jest.fn();
    store.subscribe("channel1", mockFn);

    store.publish("channel2", "message1");
    expect(mockFn).not.toHaveBeenCalled();
  });

  describe("StoreValue", () => {
    it("should correctly determine type", () => {
      let value = new StoreValue("key1", []);
      expect(value.getType()).toBe("array");

      value = new StoreValue("key2", 123);
      expect(value.getType()).toBe("integer");

      value = new StoreValue("key3", "string");
      expect(value.getType()).toBe("string");
    });
  });
});
