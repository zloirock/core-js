import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
// instance-chain-combined emit wraps the conditional rewrite in parens when the parent
// demands grouping (binary `+ 1` here). at a statement-leading slot the leading `(` would
// fuse with the preceding statement via ASI (`f()\n(_polyfill(...))` -> `f()(...)`,
// TypeError at runtime). a leading `;` is inserted so ASI sees a separate statement boundary
f();
(null == (_ref = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, y => y)) + 1;