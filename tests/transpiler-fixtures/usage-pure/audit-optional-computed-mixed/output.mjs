import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a single chain mixes `?.(`, `?.[`, and `?.prop`; verifies each optional shape is rewritten
// in place without losing the `.` between hops.
null == (_ref = obj?.(key)?.[idx]) ? void 0 : _at(_ref).call(_ref, 0);