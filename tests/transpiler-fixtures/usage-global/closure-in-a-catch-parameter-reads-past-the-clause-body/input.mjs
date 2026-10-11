// a closure written in a catch parameter runs in the parameter's environment, which the clause's body block
// never joins, so it reads past what that block binds in itself; a `var` of the body hoists past the block
// to the enclosing function or module scope, and that is the binding the closure reads
try { f(); } catch ({ x = () => Map.groupBy(xs, g) }) { let Map = 1; use(x(), Map); }
const s = 'abc';
try { f(); } catch ({ y = () => s.at(-1) }) { const s = [1, 2]; use(y(), s); }
try { f(); } catch ({ z = () => Promise.resolve(1) }) { var Promise = 1; use(z(), Promise); }
