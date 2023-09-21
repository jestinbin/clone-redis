class Operation {
  constructor(code) {
    this.code = code;
  }

  static checkOperationCode(op, codes) {
    if (op instanceof Operation) {
      if (Array.isArray(codes)) {
        return codes.includes(op.code);
      } else {
        return op.code === codes;
      }
    }
    return false;
  }

  static checkOperation(op) {
    return op instanceof Operation;
  }
}

export default Operation;
