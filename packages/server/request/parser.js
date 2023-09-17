import CustomError from "../../common/customError.js";

/**
 * Here we're reinventing the wheel: a simple JSON based protocol
 * that can handle variable-length strings
 *
 * schema: <command>(:<len_x>:<arg_x>)*
 * in:     "set:19:{"a":"asd","b":123}:2:12"
 * out:    { command: "set", arg1: {"a":"asd","b":123}, arg2: 12 }
 *
 */

function parseRequest(request) {
  try {
    const outcome = {};

    // check ":" existence
    const firstColonIndex = request.indexOf(":");
    if (firstColonIndex === -1) {
      outcome.command = request.trimEnd();
      return outcome;
    }

    outcome.command = request.substring(0, firstColonIndex);

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
      outcome[`arg${argIndex++}`] = JSON.parse(arg);

      index += num;
    }

    return outcome;
  } catch (error) {
    throw new CustomError("Malformed input", error, { request });
  }
}

export { parseRequest };
