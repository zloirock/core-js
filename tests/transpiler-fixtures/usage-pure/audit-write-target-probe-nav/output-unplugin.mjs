import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref2, _ref3;
// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
_globalThis.writeBox = { n: 1, list: ['ab', 'cd'] };
let held;
export function writes() {
  (null == _globalThis.window ? void 0 : _self.writeBox).n = 2;
  (null == _globalThis.window ? void 0 : _self.writeBox).n += 3;
  (null == _globalThis.window ? void 0 : _self.writeBox).n++;
  --(null == _globalThis.window ? void 0 : _self.writeBox).n;
  (null == _globalThis.window ? void 0 : _self.writeBox).n ??= 9;
  [(null == _globalThis.window ? void 0 : _self.writeBox).n] = [5];
  ({ k: (null == _globalThis.window ? void 0 : _self.writeBox).n } = { k: 6 });
  delete (_globalThis.writeBox).n;
  for ((null == _globalThis.window ? void 0 : _self.writeBox).n of [1]) break;
  return null == _globalThis.window ? void 0 : _self.writeBox.n;
}

// the same slot behind the two layers this family collapses through: a SEQUENCE and an effectful
// root. the write must still reach the guarded object, and the root effect must run once
export function layeredWrites() {
  var _ref;
  ('x', null == _globalThis.window ? void 0 : _self.writeBox).n = 2;
  ('x', null == _globalThis.window ? void 0 : _self.writeBox).n += 3;
  ('x', null == (held = _globalThis).window ? void 0 : _self.writeBox).n = 5;
  [('x', null == _globalThis.window ? void 0 : _self.writeBox).n] = [6];
  delete ('x', _globalThis.writeBox).n;
  ('x', null == _globalThis.window ? void 0 : _self.writeBox).list = null == (_ref = null == _globalThis.window ? void 0 : _self.writeBox.list) ? void 0 : _at(_ref).call(_ref, 0);
  return held;
}
export { held };

// the dispatches above take a nav receiver, which carries no type, so they record the GENERIC
// entry. this row narrows: a literal receiver resolves to `array`, and the element type `at`
// yields carries the second call to `string`. a single-family dispatch shows neither verdict
export const typedNarrowing = null == (_ref2 = _atMaybeArray(_ref3 = ['ab', 'cd']).call(_ref3, (null == _globalThis.window ? void 0 : _self.writeBox.list) ? 0 : 1)) ? void 0 : _includesMaybeString(_ref2).call(_ref2, 'a');