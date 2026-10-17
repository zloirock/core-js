import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// the probe nav as a WRITE target: every slot that takes a reference rather than a value. the guard
// renders the same way it does in a read, and the write lands on the object the guard yields - a
// fold into the alternate would write to the short-circuit value instead
_globalThis.writeBox = {
  n: 1,
  list: ['ab', 'cd']
};
let held;
// the same slot behind the two layers this family collapses through: a SEQUENCE and an effectful
// root. the write must still reach the guarded object, and the root effect must run once - and the
// `delete` re-hangs its tail off the guard through the carrier, as its carrier-less twin does
export function layeredWrites() {
  var _ref;
  ('x', null == _globalThis.window ? void 0 : _self.writeBox).n = 2;
  ('x', null == _globalThis.window ? void 0 : _self.writeBox).n += 3;
  ('x', null == (held = _globalThis).window ? void 0 : _self.writeBox).n = 5;
  [('x', null == _globalThis.window ? void 0 : _self.writeBox).n] = [6];
  delete ('x', (null == _globalThis.window ? void 0 : _self)?.writeBox).n;
  ('x', null == _globalThis.window ? void 0 : _self.writeBox).list = null == (_ref = null == _globalThis.window ? void 0 : _self.writeBox.list) ? void 0 : _at(_ref).call(_ref, 0);
  return held;
}
export { held };