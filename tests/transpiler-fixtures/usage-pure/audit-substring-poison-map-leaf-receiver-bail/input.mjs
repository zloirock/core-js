// `Map?.X.flat?.()` - parity with Promise-leaf bail case: outer instance-call emission
// resolves the receiver chain `Map?.X` to the substituted `_Map.X`. the inner
// MemberExpression's own `Map` substitution must not fire again inside the already-substituted
// receiver - a substring-blind rewrite once produced `__Map.X` (double underscore, a
// ReferenceError at runtime).
Map?.X.flat?.();
