import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2;
// `(globalThis?.X)?.Y.flat?.(0)` - mid-hop optional preservation. rebuild path drops `?.`
// at the leaf-adjacent hop (polyfill always defined) but MUST preserve `?.` at mid-hop
// (`?.Y` could still hit a nullish `_globalThis.X`). without per-hop optionality, rebuild
// would emit `_globalThis.X.Y` (lost optional) - any `_globalThis.X === undefined` case
// throws TypeError on `.Y` access instead of short-circuiting.
null == (_ref = _globalThis.X) ? void 0 : _flatMaybeArray(_ref2 = _ref.Y)?.call(_ref2, 0);