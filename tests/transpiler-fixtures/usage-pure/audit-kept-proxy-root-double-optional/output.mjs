import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// two optionals over a proxy root: only the one reading the environment probe keeps a test, and a
// dead `?.` past `self` folds with no memo - also through an alias-carried store, where one memo at the
// root holds the probe and the keys migrate. an optional CALL between the hops ends the fold: the probe
// keeps its guard and the key's effect runs only where native runs it. NEGATIVE: an ordinary
// double-optional chain keeps its leaf-nearest memo, the inner `?.` living inside the memoized value.
export const bareDoubleOptional = null == _globalThis.window ? void 0 : _flatMaybeArray(_self.Array.prototype).call([2, [3]]);
let oc = 0;
let cb;
export const optionalCallHop = () => (null == (cb = _globalThis.window) ? void 0 : (oc++, _self))?.().Array;
export { oc };
let c3 = 0;
const galias = _globalThis;
let alk;
export const aliasDoubleOptional = null == (alk = galias.window) ? void 0 : _atMaybeArray(alk[c3++, "Array"].prototype).call([7], 0);
export { c3 };
const holder = {
  p: {
    q: [4, [5]]
  }
};
export const ordinaryDoubleOptional = null == (_ref = holder.p?.q) ? void 0 : _findLastIndexMaybeArray(_ref).call(_ref, v => Array.isArray(v));