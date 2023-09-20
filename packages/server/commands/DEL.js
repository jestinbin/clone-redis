import { checkRequiredArg } from "../utils.js";

export default ({ store }, key) => {
  checkRequiredArg(key, "key");
  return store.delete(key);
};
