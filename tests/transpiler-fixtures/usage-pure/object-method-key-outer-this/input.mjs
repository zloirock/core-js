// A computed method key evaluates with the enclosing this, including under arrows.
// The method body keeps its own receiver.
const o = { [this.Symbol.iterator]() { return this; } };
