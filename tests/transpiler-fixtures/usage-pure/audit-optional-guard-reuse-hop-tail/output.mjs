import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4;
// an INNER maybe-instance dispatch whose chain root is already memoized by an OUTER guard
// reuses the guard ref and stitches the RAW hop tail off it (`_ref.self...`): a hop collapse
// would read a binding the guard never proved and subsume the kept call's own root rewrite
export const r = null == (_ref = (() => _globalThis)()) ? void 0 : _joinMaybeArray(_ref2 = _flatMaybeArray(_ref.self.Array.prototype).call([1, [2]])).call(_ref2, ',');
// the deeper multi-hop tail stitches the same way
export const d = null == (_ref3 = (() => _globalThis)()) ? void 0 : _joinMaybeArray(_ref4 = _flatMapMaybeArray(_ref3.self.window.Array.prototype).call([1], n => [n])).call(_ref4, ';');