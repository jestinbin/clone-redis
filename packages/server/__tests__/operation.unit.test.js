import Operation from "../operation";

describe("Operation class", () => {
  describe("constructor", () => {
    it("should set the code property", () => {
      const operation = new Operation("OP1");
      expect(operation.code).toBe("OP1");
    });
  });

  describe("checkOperationCode", () => {
    it("should return true if the code matches a single code", () => {
      const operation = new Operation("OP1");
      expect(Operation.checkOperationCode(operation, "OP1")).toBe(true);
    });

    it("should return true if the code matches one in an array of codes", () => {
      const operation = new Operation("OP1");
      expect(Operation.checkOperationCode(operation, ["OP1", "OP2"])).toBe(
        true
      );
    });

    it("should return false if the code does not match the given code or array of codes", () => {
      const operation = new Operation("OP3");
      expect(Operation.checkOperationCode(operation, ["OP1", "OP2"])).toBe(
        false
      );
    });

    it("should return false if the provided object is not an instance of Operation", () => {
      expect(Operation.checkOperationCode({}, "OP1")).toBe(false);
    });
  });

  describe("checkOperation", () => {
    it("should return true if the object is an instance of Operation", () => {
      const operation = new Operation("OP1");
      expect(Operation.checkOperation(operation)).toBe(true);
    });

    it("should return false if the object is not an instance of Operation", () => {
      expect(Operation.checkOperation({})).toBe(false);
    });
  });
});
