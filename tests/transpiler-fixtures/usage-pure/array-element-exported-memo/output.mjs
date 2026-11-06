import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A receiver memo stays private; only the source bindings are exported.
const before = start(),
  _ref = receiver.value,
  at = _at(_ref),
  includes = _includes(_ref),
  after = finish();
export { before, at, includes, after };