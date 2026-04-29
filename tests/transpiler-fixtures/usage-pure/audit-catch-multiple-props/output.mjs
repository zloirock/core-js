import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// multiple instance methods on a catch-destructured error: `includes` and `at` are each
// extracted via their polyfill helper, sharing the same `_ref` binding for the receiver
try {
  risky();
} catch (_ref) {
  let includes = _includes(_ref);
  let at = _at(_ref);
  includes("k");
  at(0);
}