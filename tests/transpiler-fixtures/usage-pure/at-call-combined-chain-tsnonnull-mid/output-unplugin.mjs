import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2, _ref3;
// A TS non-null wrapper (`!`) sitting under the outer member of a combined optional poly-chain must
// not break the intermediate-hop marking walk. `arr.flat?.().map(x => x)!.at(-1)` combines the
// optional chain into a single null-guarded emit; a wrapper-blind marking walk stops at the `!`,
// leaves the inner poly hops unmarked, and the visitor re-matches the same inner chain - queuing an
// overlapping transform that crashes ("could not locate inner needle").
const arr: number[] = [1];
null == (_ref = _flatMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, x => x)).call(_ref2, -1);
