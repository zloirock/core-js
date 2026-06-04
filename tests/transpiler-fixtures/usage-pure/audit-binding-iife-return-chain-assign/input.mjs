// IIFE returning a chain-assign: `(() => (a = Array))()` evaluates to Array, but the call ALSO
// writes `a`. the receiver inlines to Array (peeling the chain-assign rhs), and the whole IIFE is
// preserved as a side effect so the `a = Array` write is not dropped - the substitution emits
// `((() => a = Array)(), _Array$from)([])`, keeping `Array` raw (global) so `a` gets the real Array
(() => (a = Array))().from([]);
