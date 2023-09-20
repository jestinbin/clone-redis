import { checkRequiredArg } from "../utils.js";
import CustomError from "./../../commons/customError.js";

// NOTES: it works only with a single value
export default ({ store, outFn }, key, value) => {
  checkRequiredArg(key, "key");
  return store.blpop(key, outFn);
};
