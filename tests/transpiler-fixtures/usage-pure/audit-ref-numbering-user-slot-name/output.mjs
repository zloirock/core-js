import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref3;
// a USER binding wearing a plugin slot-shaped name (`_ref2`) in a NESTED scope the
// allocator's use-site chain cannot see: allocation must still avoid it and the exit
// numbering repair must keep both emitters on identical ref names
function nest() {
  let _ref2 = _globalThis.userThing;
  return _ref2;
}
export const r1 = _at(_ref = _globalThis.box).call(_ref, 0);
export const r2 = _flatMaybeArray(_ref3 = _globalThis.box2).call(_ref3);
export { nest };