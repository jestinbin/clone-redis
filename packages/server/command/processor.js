import { parseRequest } from "../request/parser.js";
import CustomError from "../../common/customError.js";

export default (store, outFn) => {
  return (request) => {
    const requestString = request.toString();
    // console.log(`Command received from client: "${request.toString()}"`);

    try {
      const command = parseRequest(requestString);
      const outcome = "something"; // TODO:
      outFn(JSON.stringify(command));
    } catch (error) {
      throw new CustomError("Processor error", error, { request });
    }
  };
};
