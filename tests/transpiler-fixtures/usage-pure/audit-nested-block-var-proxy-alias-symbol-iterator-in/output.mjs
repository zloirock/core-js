import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol";
// A conditionally initialized block-hoisted alias keeps its realm-identity guard.
// The realm branch must provide Symbol.iterator before the in check, while an
// uninitialized alias preserves the native throw.
function f(c, obj) {
  if (c) {
    var g = _globalThis;
  }
  return (g === _globalThis ? _Symbol : g.Symbol).iterator in obj;
}
f(true, []);