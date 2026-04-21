import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// inner polyfill followed by `?.` within outer — guardNeedsParens checks containsRange to
// suppress the extra-parens heuristic when the `?.` is inside another queued transform
const r = null == (_ref = obj == null ? void 0 : _at(obj).call(obj, 0)) ? void 0 : _includes(_ref).call(_ref, 42);