import _Promise from "@core-js/pure/actual/promise";
// A private method destructures a constructor out of a literal wrapper.
// The native pattern keeps the supplied constructor's whole namespace.
class Factory {
  static #read({
    C
  }) {
    return typeof C.allSettled;
  }
  static run() {
    return Factory.#read({
      C: _Promise
    });
  }
}
Factory.run();