import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A conditional var initializer does not prove the alias is the realm on every path.
// A runtime identity guard may select the backed self entry when that initializer ran;
// otherwise it must keep g.self, including the TypeError from an unassigned g.
// The surrounding sequence and later instance read retain their evaluation positions.
function f(c) {
  if (c) {
    var g = _globalThis;
  }
  return _findLastIndexMaybeArray((0, g === _globalThis ? _self : g.self).Array.prototype);
}
export { f };