import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// Stored terminal probes retain their value across quiet keys and sequence prefixes.
// Effectful realm keys keep the source read before the store.
let p,
  q,
  r,
  s,
  effects = 0;
export const terminal = null == (p = _self.window) ? void 0 : _Array$from([1]);
export const prefix = null == (q = (effects++, _self).window) ? void 0 : _Array$of(2);
export const computed = (r = _self[effects++, 'window'])?.Object.entries({
  a: 3
});
export const middle = (s = (effects++, _self), _Map).length;
export const residualStatic = null == (p = _self.window) ? void 0 : _Map.length;
export { p, q, r, s, effects };