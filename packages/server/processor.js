import { decode } from "../commons/protocol.js";
import CustomError from "../commons/customError.js";
import commandProcessors from "./commands/index.js";

function executeCommand(command, store) {
  const commandKey = command?.name?.toUpperCase();
  if (commandProcessors?.[commandKey]) {
    // console.log(`execute command "${commandKey}" with args`, command.args);
    return commandProcessors[commandKey](store, ...command.args);
  } else {
    throw new CustomError(
      `command "${command.name}" doesn't exist`,
      null,
      JSON.stringify(command)
    );
  }
}

export default (store, outFn) => {
  return (request) => {
    const requestString = request.toString().trimEnd();
    try {
      const command = decode(requestString);
      const outcome = executeCommand(command, store);
      outFn(outcome);
    } catch (error) {
      throw new CustomError("Processor error", error, {
        request,
        requestString,
      });
    }
  };
};
