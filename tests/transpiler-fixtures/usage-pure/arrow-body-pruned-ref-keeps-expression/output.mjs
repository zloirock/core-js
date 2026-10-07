import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// An arrow's expression body stays an expression when the memo its rewrite declared is dropped:
// babel braced the body to host the `var`, and that block is no text the source wrote. A body the
// user wrote as a block stays one.
const mk = () => _globalThis;
let g;
export const viaDecided = () => (g = _Map$groupBy, _Map);
export const viaEffect = () => (_pushMaybeArray(log).call(log, 'p'), g = _Map$groupBy, _Map);
export const viaCallNav = () => (g = _Map$groupBy, _Map);
export const asWritten = () => {
  return g = _Map$groupBy, _Map;
};