class Operation {
  constructor(code) {
    this.code = code;
  }

  static checkOperationCode(op, code) {
    return op instanceof Operation && op.code === code;
  }

  static checkOperation(op) {
    return op instanceof Operation;
  }
}

export default Operation;
