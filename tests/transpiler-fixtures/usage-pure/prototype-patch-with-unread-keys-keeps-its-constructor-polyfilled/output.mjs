import _Map from "@core-js/pure/actual/map/constructor";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Set from "@core-js/pure/actual/set/constructor";
// a patch of a built-in prototype under keys no canon reads leaves its members unknown, not its constructor:
// the construction ahead of the patch takes the pure constructor (an old engine's own lacks its fixes), and
// the patch lands on that constructor's prototype, so the instances made before it carry the members too
export const counts = new _Map([[1, 2]]);
for (const name of _Object$keys(extensions)) Object.defineProperty(_Map.prototype, name, {
  value: extensions[name]
});
export const total = () => counts.total();
export const seen = new _Set([1]);
_Object$assign(_Set.prototype, makeExtensions());
export const sum = () => seen.sum();