import { checkRequiredArg } from "../utils.js";
import CustomError from "./../../commons/customError.js";

export default ({ store, outFn }, key) => {
  checkRequiredArg(key, "key");
  return store.subscribe(key, outFn);
};
