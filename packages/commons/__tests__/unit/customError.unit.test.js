import CustomError from "../../customError.js";

describe("CustomError", () => {
  it("should correctly set the message", () => {
    const error = new CustomError("Custom message");
    expect(error.message).toBe("Custom message");
  });

  it("should correctly set the original error and its stack", () => {
    const originalError = new Error("Original error message");
    const error = new CustomError("Custom message", originalError);
    expect(error.originalError).toBe(originalError);
    expect(error.stack).toBe(originalError.stack);
  });

  it('should correctly set the name to "CustomError"', () => {
    const error = new CustomError("Custom message");
    expect(error.name).toBe("CustomError");
  });

  it("should correctly set the extra data", () => {
    const extraData = { key: "value" };
    const error = new CustomError("Custom message", null, extraData);
    expect(error.extra).toEqual(extraData);
  });

  it("should default extra to null if not provided", () => {
    const error = new CustomError("Custom message");
    expect(error.extra).toBeNull();
  });

  it("should not have originalError if not provided", () => {
    const error = new CustomError("Custom message");
    expect(error.originalError).toBeUndefined();
  });
});
