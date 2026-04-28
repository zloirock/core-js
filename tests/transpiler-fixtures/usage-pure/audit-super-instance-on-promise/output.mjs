import _Promise from "@core-js/pure/actual/promise/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
// same conservative skip for non-Array known-polyfillable supers (Promise, Map, Set,
// Iterator). polyfill bodies for these consult `this.constructor[Symbol.species]` /
// internal slots / iterator hooks through `this`, so a subclass override leaks into
// `_X.call(this, ...)` while native `super.X` ignores it. extends-binding remap
// (`Promise -> _Promise`, `Map -> _Map`) still fires - only the super-call rewrite is skipped
class P extends _Promise {
  done(v) {
    return super.then(v);
  }
}
class M extends _Map {
  values() {
    return super.entries();
  }
}