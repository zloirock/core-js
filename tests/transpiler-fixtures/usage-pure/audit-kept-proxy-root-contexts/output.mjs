import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref4;
// the syntactic CONTEXTS a kept proxy root can be reached from. the rule does not depend on any of them -
// the assignment stays as the root, the redundant proxy hop drops, the guard survives - but each context
// reaches the collapse through its own visitor, so each pins separately: a kept root nested inside another
// kept root's value, a destructuring default, a class static method, an async arrow body, and a computed
// leaf key. distinct methods per line.
let n;
export const nestedKeptRoot = null == (_ref = n = _globalThis.window?.self.window) ? void 0 : _flatMaybeArray(_ref.Array.prototype).call([1, [2]]);
let p;
export const inDestructureDefault = (({
  x = null == (_ref2 = p = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2.Array.prototype)
} = {}) => x)();
class Probe {
  static read() {
    var _ref3;
    let q;
    return null == (_ref3 = q = _globalThis.window) ? void 0 : _findLastMaybeArray(_ref3.Array.prototype).call([1], it => it);
  }
}
export const inClassStatic = Probe.read();
let r;
export const inAsyncArrow = (async () => (r = _globalThis.window)?.Array.prototype.some.call([1], it => it))();
let s;
export const computedLeafKey = null == (_ref4 = s = _globalThis.window) ? void 0 : _atMaybeArray(_ref4['Array'].prototype).call([1], 0);