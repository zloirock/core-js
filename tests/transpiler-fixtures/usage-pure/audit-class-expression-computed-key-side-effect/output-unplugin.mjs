import _Array$from from "@core-js/pure/actual/array/from";
// `mayHaveSideEffects` covers class evaluation:
//   - ClassExpression with computed-key expressions (`class { [fn()]() {} }`) - the
//     computed key is evaluated at class-eval time, so SE
//   - static field initializers + StaticBlock body also class-eval time
//   - non-static class with literal computed key (`["x"]`) is SE-free, can be folded
// destructure flatten lifts the leading expressions of the SE init as a standalone
// statement; trim drops trailing no-op identifiers (Array). A computed-key with `fn()`
// is SE-bearing and stays in the lifted statement so the call site is preserved
(class { [fn()]() {} }, Array);
var from = _Array$from;
from([1]);