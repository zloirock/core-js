import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// optional member wrapped in inner parens then a stack of TS casts, called
// non-optionally; throw-on-nullish semantics survive the wrapper stack
declare function getArr(): number[] | null;
(null == (_ref = getArr()) ? void 0 : _includesMaybeArray(_ref)).call(_ref, 1);
(null == (_ref2 = getArr()) ? void 0 : _atMaybeArray(_ref2)).call(_ref2, 0);