import { checkRequiredArg } from "../utils.js";

export default ({ store }, key, value, seconds = undefined) => {
  checkRequiredArg(key, "key");
  checkRequiredArg(value, "value");
  return store.set(key, value, seconds);
};
