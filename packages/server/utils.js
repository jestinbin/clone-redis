function checkRequiredArg(value, argName) {
  if (value === undefined) {
    throw new Error(
      `The value for "${argName}" is required and cannot be undefined.`
    );
  }
}

export { checkRequiredArg };
