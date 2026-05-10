import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// optional member wrapped in inner parens then a TS cast, called non-optionally:
// chain ends at the optional access, outer call throws on nullish per native semantics
declare function getArr(): number[] | null;
(null == (_ref = getArr()) ? void 0 : _includesMaybeArray(_ref)).call(_ref, 1);
(null == (_ref2 = getArr()) ? void 0 : _atMaybeArray(_ref2)).call(_ref2, 0);