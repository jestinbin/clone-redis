class Command {
  constructor(name, args = []) {
    if (typeof name !== "string") {
      throw new TypeError('Expected "name" to be a string');
    }
    if (!Array.isArray(args)) {
      throw new TypeError('Expected "args" to be an array');
    }

    this.name = name;
    this.args = args;
  }
}

export default Command;
