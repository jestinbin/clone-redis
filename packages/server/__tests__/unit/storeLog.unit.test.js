import StoreLog from "../../store/storeLog.js";

describe("StoreLog", () => {
  describe("Constructor", () => {
    it('should throw TypeError if "name" is not a string', () => {
      expect(() => new StoreLog(12345)).toThrow(TypeError);
      expect(() => new StoreLog(12345)).toThrow(
        'Expected "name" to be a string'
      );

      expect(() => new StoreLog([])).toThrow(TypeError);
      expect(() => new StoreLog([])).toThrow('Expected "name" to be a string');

      expect(() => new StoreLog({})).toThrow(TypeError);
      expect(() => new StoreLog({})).toThrow('Expected "name" to be a string');

      expect(() => new StoreLog("validName")).not.toThrow();
    });

    it('should throw TypeError if "args" is not an array', () => {
      expect(() => new StoreLog("name", "invalidArgs")).toThrow(TypeError);
      expect(() => new StoreLog("name", "invalidArgs")).toThrow(
        'Expected "args" to be an array'
      );

      expect(() => new StoreLog("name", 12345)).toThrow(TypeError);
      expect(() => new StoreLog("name", 12345)).toThrow(
        'Expected "args" to be an array'
      );

      expect(() => new StoreLog("name", {})).toThrow(TypeError);
      expect(() => new StoreLog("name", {})).toThrow(
        'Expected "args" to be an array'
      );

      expect(
        () => new StoreLog("name", ["validArg1", "validArg2"])
      ).not.toThrow();
    });
  });
});
