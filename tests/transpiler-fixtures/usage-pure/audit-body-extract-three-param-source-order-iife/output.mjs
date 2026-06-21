import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// three function params each with a polyfilled prop + rest sibling all bail to body-extract;
// emitted `let from` / `let keys` / `let resolve` must follow SOURCE order, not reverse.
// three distinct constructors (Array.from, Object.keys, Promise.resolve) so imports identify each.
// immediately invoked, so caller-lossy param emit is sound (every call site visible)
(function f({
  from: _unused,
  ...r1
} = Array, {
  keys: _unused2,
  ...r2
} = Object, {
  resolve: _unused3,
  ...r3
} = _Promise) {
  let from = _Array$from;
  let keys = _Object$keys;
  let resolve = _Promise$resolve;
  return [from([1]), keys({}), resolve(0), r1, r2, r3];
})();