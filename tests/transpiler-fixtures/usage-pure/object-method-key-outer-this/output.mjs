import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A computed method key evaluates with the enclosing this, including under arrows.
// The method body keeps its own receiver.
const o = {
  [_Symbol$iterator]() {
    return this;
  }
};