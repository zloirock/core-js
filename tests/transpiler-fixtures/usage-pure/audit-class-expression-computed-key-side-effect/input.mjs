// `mayHaveSideEffects` extension covers class evaluation:
//   - ClassExpression with computed-key expressions (`class { [fn()]() {} }`) - the
//     computed key is evaluated at class-eval time, so SE
//   - static field initializers + StaticBlock body also class-eval time
//   - non-static class with literal computed key (`["x"]`) is SE-free, can be folded
// destructure flatten lifts the leading expressions of the SE init as a standalone
// statement; trim drops trailing no-op identifiers (Array). pre-fix the SE walker
// returned `false` for ALL ClassExpression nodes, so `(class { [fn()]() {} }, Array)`
// folded to just the destructure - dropping `fn()` evaluation. post-fix the class
// is preserved in the lifted statement
var { from } = (class { [fn()]() {} }, Array);
from([1]);
