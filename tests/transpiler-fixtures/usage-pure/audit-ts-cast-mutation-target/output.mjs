import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref, _ref2;
// a mutation target behind stacked wrappers (TS cast, doubled parens) still records: the
// classification peels DOWNWARD from the mutation host, so wrapper depth is unbounded
delete (_Map.groupBy as any);
export const r1 = _Map.groupBy(x, f);
_Iterator.from ||= shim;
export const r2 = _Iterator.from(it);
Object.defineProperty(_Map, 'groupBy', {
  value: dpPatch
});
export const r3 = _Map.groupBy(y, g);
// an ENUM-member computed key stays unresolved - the detection canon resolves literals,
// templates and const-bound identifier chains, not type-layer enums (consistent boundary)
enum HopKeys {
  MAP = 'map',
}
export const r4 = null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _ref.call(arr)[HopKeys.MAP](f)) ? void 0 : _at(_ref2).call(_ref2, 0);