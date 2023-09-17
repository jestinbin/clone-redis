class CustomError extends Error {
  constructor(message, originalError, extra = null) {
    super(message);

    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }

    this.originalError = originalError;
    this.name = "CustomError";
    this.extra = extra;
  }
}

export default CustomError;
