import { checkRequiredArg } from "../../utils.js";

describe("checkRequiredArg function", () => {
  it("should not throw an error when a valid value is provided", () => {
    expect(() => checkRequiredArg("testValue", "testArg")).not.toThrow();
  });

  it("should throw an error when the value is undefined", () => {
    expect(() => checkRequiredArg(undefined, "testArg")).toThrow(
      'The value for "testArg" is required and cannot be undefined.'
    );
  });

  it("should include the correct argument name in the error message", () => {
    const argName = "customArgName";
    expect(() => checkRequiredArg(undefined, argName)).toThrow(
      `The value for "${argName}" is required and cannot be undefined.`
    );
  });
});
