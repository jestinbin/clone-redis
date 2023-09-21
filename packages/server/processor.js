import { decode } from "../commons/protocol.js";
import CustomError from "../commons/customError.js";
import commandProcessors from "./commands/index.js";
import logger from "../commons/logger.js";
import Operation from "./operation.js";
import config from "./config.js";

const {
  OPERATIONS: { WAITING_FOR_RESPONSE, NO_RESPONSE },
} = config;

function executeCommand(command, context) {
  const commandKey = command?.name?.toUpperCase();
  if (commandProcessors?.[commandKey]) {
    // logger.debug(`execute command "${commandKey}" with args [${command.args}]`);
    return commandProcessors[commandKey](context, ...command.args);
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
    // logger.debug(`request string "${requestString}"`);
    try {
      const context = { store, outFn };
      const command = decode(requestString);
      const outcome = executeCommand(command, context);
      if (
        !Operation.checkOperationCode(outcome, [
          WAITING_FOR_RESPONSE,
          NO_RESPONSE,
        ])
      ) {
        outFn(outcome);
      }
    } catch (error) {
      throw new CustomError("Processor error", error, {
        // request,
        requestString,
      });
    }
  };
};
