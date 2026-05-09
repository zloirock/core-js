import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// flatten sibling decl simultaneously substitutes `globalThis -> _globalThis` AND hosts
// a nested function whose body emits `var _ref;` for an optional-chain instance polyfill.
// the inner function body opens AT a source position AFTER the substitution site, so
// substitution and ref-binding splices must be merged into a single descending-order pass
// over the original-source preservedSrc - applying substitution first would shift the
// body anchor offset and the `var _ref;` would land mid-token instead of after `{`
const from = _Array$from;
const val = (function () {
  const x = _globalThis;
  return (function inner() {
var _ref; return null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref()); })();
})();
console.log(from, val);