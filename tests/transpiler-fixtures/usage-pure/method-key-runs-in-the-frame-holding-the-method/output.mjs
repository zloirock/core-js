import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a method's computed key runs where the class or object literal stands, not in the method: a key read
// ahead of a patch below takes the pure import. a write in a key runs before every static field, so a
// static field read after it in evaluation reads the user's slot, wherever the text puts it
export class List {
  [_Symbol$iterator]() {
    return this;
  }
}
export const table = {
  get [_nameMaybeFunction(_Promise)]() {
    return 1;
  }
};
export class Registry {
  static seen = new Set();
  [(_globalThis.Set = ShimSet, 'register')]() {}
}
_globalThis.Symbol = ShimSymbol;
_globalThis.Promise = ShimPromise;