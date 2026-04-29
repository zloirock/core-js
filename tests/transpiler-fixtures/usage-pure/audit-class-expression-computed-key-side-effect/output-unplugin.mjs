import _Array$from from "@core-js/pure/actual/array/from";
// side-effect detection for class evaluation covers:
//   - class expression with computed-key expressions (`class { [fn()]() {} }`) - the
//     computed key is evaluated at class-eval time, so it has side effects
//   - static field initializers + static block body also run at class-eval time
//   - non-static class with literal computed key (`["x"]`) is side-effect-free
// Destructure flatten lifts the leading expressions of the SE init as a standalone
// statement; trim drops trailing no-op identifiers (Array). A computed key with `fn()`
// is SE-bearing and stays in the lifted statement so the call site is preserved
(class { [fn()]() {} }, Array);
var from = _Array$from;
from([1]);