import CustomError from "./customError.js";
import Command from "./../commons/Command.js";

/**
 * Here we're reinventing the wheel: a simple JSON based protocol
 * that can handle variable-length strings
 *
 * schema: 	<name>(:<len_x>:<arg_x>)*
 * encoded: "set:19:{"a":"asd","b":123}:2:12"
 * decoded: { name: "set", arg1: {"a":"asd","b":123}, arg2: 12 }
 *
 */

function decode(request) {
  try {
    // check ":" existence
    const firstColonIndex = request.indexOf(":");
    if (firstColonIndex === -1) {
      return new Command(request.trimEnd(), []);
    }

    const decoded = new Command(request.substring(0, firstColonIndex), []);

    let index = firstColonIndex;
    let argIndex = 1;
    const requestLength = request.length;

    while (index < requestLength) {
      // search for the next `:(num)*:`
      const match = request.substring(index).match(/:(\d+):/);

      if (!match) break;

      const num = parseInt(match[1], 10);
      const matchLength = match[0].length;

      index += matchLength;
      const arg = request.substring(index, index + num);
      decoded.args.push(JSON.parse(arg));

      index += num;
    }

    return decoded;
  } catch (error) {
    throw new CustomError("Decoding error", error, { request });
  }
}

function encode(command) {
  try {
    let encoded = command.name;

    for (let arg of command.args) {
      // Convert the argument into a string. JSON.stringify is used for objects, arrays, and special values like null.
      let argString =
        typeof arg === "string" ? `"${arg}"` : JSON.stringify(arg);

      // Append the length of the argument and the argument itself to the encoded string.
      encoded += `:${argString.length}:${argString}`;
    }

    return encoded;
  } catch (error) {
    throw new CustomError("Encoding error", error, { command });
  }
}

export { decode, encode };
