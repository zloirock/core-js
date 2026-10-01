import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// A conditionally initialized block-hoisted alias keeps its realm-identity guard.
// The realm branch answers the is-iterable value test (a sham Symbol.iterator would
// never be found on an iterable), while an uninitialized alias preserves the native throw.
function f(c, obj) {
  if (c) {
    var g = _globalThis;
  }
  return g === _globalThis ? _isIterable(obj) : g.Symbol.iterator in obj;
}
f(true, []);