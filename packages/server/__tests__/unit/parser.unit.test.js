import { jest } from "@jest/globals";
import { parseRequest } from "../../request/parser.js";

const outputCheck = (input, expectedOutput) => {
  const output = parseRequest(input);
  expect(output).toEqual(expectedOutput);
};

describe("parseRequest", () => {
  it("should return just the command when no arguments are provided", () => {
    const input = "set";
    const output = parseRequest(input);
    expect(output).toEqual({ command: "set" });
  });

  it("should throw an error with malformed input", () => {
    const malformedInput = "set:1:{}:2:abc";
    const parseFunction = () => parseRequest(malformedInput);
    expect(parseFunction).toThrowError("Malformed input");
  });

  it("should parse a request with arguments correctly", () => {
    outputCheck(
      `set:4:null:2:12:3:"a":4:true:5:false:23:{"a":"asd::","b:2":123}`,
      {
        command: "set",
        arg1: null,
        arg2: 12,
        arg3: "a",
        arg4: true,
        arg5: false,
        arg6: { a: "asd::", "b:2": 123 },
      }
    );
  });
});
