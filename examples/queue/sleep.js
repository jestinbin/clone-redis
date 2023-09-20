const sleep = (delayMs) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));
export default sleep;
