// `Map?.X.flat?.()` - parity with Promise-leaf bail case: outer instance-call emission
// resolves the receiver chain `Map?.X` to substituted text `_Map.X`. without word-boundary
// guarding, the inner-MemberExpression's per-member transform queues a needle `Map` for
// substitution into the outer's content; substring-composition finds `Map` inside `_Map.X`
// and produces `__Map.X` (double underscore ReferenceError at runtime).
Map?.X.flat?.();
