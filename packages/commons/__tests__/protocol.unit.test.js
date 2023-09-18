import { jest } from "@jest/globals";
import { decode, encode } from "../protocol.js";

const decodingCheck = (input, expectedOutput) => {
  const output = decode(input);
  expect(output).toEqual(expectedOutput);
};

const encodingCheck = (inputCommand, expectedString) => {
  const encodedString = encode(inputCommand);
  expect(encodedString).toEqual(expectedString);
};

describe("protocol decoding", () => {
  it("should return just the command when no arguments are provided", () => {
    const input = "set";
    const output = decode(input);
    expect(output).toEqual({ name: "set", args: [] });
  });

  it("should throw an error with malformed input", () => {
    const malformedInput = "set:1:{}:2:abc";
    const parseFunction = () => decode(malformedInput);
    expect(parseFunction).toThrowError("Decoding error");
  });

  it("should parse a request with arguments correctly", () => {
    decodingCheck(
      `set:4:null:2:12:3:"a":4:true:5:false:23:{"a":"asd::","b:2":123}`,
      {
        name: "set",
        args: [null, 12, "a", true, false, { a: "asd::", "b:2": 123 }],
      }
    );
  });
});

describe("protocol encoding", () => {
  it("should encode just the command name when no arguments are provided", () => {
    const command = { name: "set", args: [] };
    const encodedString = encode(command);
    expect(encodedString).toEqual("set");
  });

  it("should throw an error when encoding problematic input", () => {
    const problematicCommand = {
      name: "set",
      args: [Symbol("a")], // Symbols can't be stringified by JSON.stringify
    };
    const encodingFunction = () => encode(problematicCommand);
    expect(encodingFunction).toThrowError("Encoding error");
  });

  it("should correctly encode a command with multiple arguments", () => {
    encodingCheck(
      {
        name: "set",
        args: [null, 12, "a", true, false, { a: "asd::", "b:2": 123 }],
      },
      `set:4:null:2:12:3:"a":4:true:5:false:23:{"a":"asd::","b:2":123}`
    );
  });
});
