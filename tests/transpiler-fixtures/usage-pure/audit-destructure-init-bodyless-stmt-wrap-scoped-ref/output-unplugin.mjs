import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// bodyless control statement (`if (...) stmt` no braces) inside destructure init forces
// `kind: stmt` body-wrap. setScope on the inner instance polyfill walks up to the
// ExpressionStatement slot under IfStatement and registers WRAP_KIND_STMT. pins the
// `kind === stmt` branch of #bodyWrapText composed-text (no `return` insertion since the
// host slot is already a Statement)
(() => {
  if (Math.random() < 0) { var _ref; _atMaybeArray(_ref = [1, 2, 3]).call(_ref, 0); }
  return Array;
})();
const from = _Array$from;
console.log(from);