import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _self from "@core-js/pure/actual/self";
// A stored terminal environment probe survives the ponyfill of its base. The outer optional
// tests that stored value; prefixes and computed keys run once before the test. A plain
// middle hop ending at a backed leaf collapses without inventing a source guard.
let p,
  q,
  r,
  s,
  effects = 0;
export const terminal = null == (p = _self.window) ? void 0 : _Array$from([1]);
export const prefix = null == (q = (effects++, _self).window) ? void 0 : _Array$of(2);
export const computed = null == (r = _self[effects++, 'window']) ? void 0 : _Object$entries({
  a: 3
});
export const middle = (s = (effects++, _self), _Map).length;
export const residualStatic = null == (p = _self.window) ? void 0 : _Map.length;
export { p, q, r, s, effects };