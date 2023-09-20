import { checkRequiredArg } from "../utils.js";
import CustomError from "./../../commons/customError.js";

// NOTES: only a single value
export default ({ store }, key, value) => {
  checkRequiredArg(key, "key");
  checkRequiredArg(value, "value");

  switch (store.type(key)) {
    case undefined:
      store.set(key, [value]);
      break;
    case "array":
      store.rpush(key, value);
      break;
    default:
      throw new CustomError(`key '${key}' is not an array`);
      break;
  }

  return true;
};
