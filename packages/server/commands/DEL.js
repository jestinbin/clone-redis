export default (store, key) => {
  // TODO: checkArgs();
  return store.delete(key);
};
