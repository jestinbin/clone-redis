import Command from "../../Command.js";

describe("Command class", () => {
  it("should create a Command instance with correct attributes", () => {
    const command = new Command("testName", ["arg1", "arg2"]);
    expect(command.name).toBe("testName");
    expect(command.args).toEqual(["arg1", "arg2"]);
  });

  it("should throw TypeError if name is not a string", () => {
    expect(() => new Command(123, ["arg1"])).toThrow(TypeError);
    expect(() => new Command(123, ["arg1"])).toThrow(
      'Expected "name" to be a string'
    );
  });

  it("should throw TypeError if args is not an array", () => {
    expect(() => new Command("testName", "arg1")).toThrow(TypeError);
    expect(() => new Command("testName", "arg1")).toThrow(
      'Expected "args" to be an array'
    );
  });
});
