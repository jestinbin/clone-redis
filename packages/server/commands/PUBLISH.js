import { checkRequiredArg } from "../utils.js";
import CustomError from "./../../commons/customError.js";

export default ({ store }, key, value) => {
  checkRequiredArg(key, "key");
  checkRequiredArg(value, "value");
  return store.publish(key, value);
};
