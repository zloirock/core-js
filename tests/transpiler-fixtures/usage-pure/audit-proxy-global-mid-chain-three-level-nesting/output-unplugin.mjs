import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// three-level Paren-wrapped chain: `((globalThis?.X)?.Y)?.Z.flat?.(0)`. rebuild must peel
// every Paren+Chain pair between hops and emit per-hop optional preservation: leaf-adjacent
// `?.X` collapses (polyfill always defined), mid-hops `?.Y` and `?.Z` preserve. asserts the
// rebuild loop handles N > 2 hops without losing optionality on intermediate segments.
null == (_ref = (_globalThis.X)?.Y) ? void 0 : _flatMaybeArray(_ref2 = _ref.Z)?.call(_ref2, 0);
