// a side-effecting computed key in a catch param extracts the dispatcher binding while the
// key survives in the residual (effect once, in order); the user default is dead code
try { risky(); } catch ({ [(e1(), 'at')]: v }) { console.log(typeof v); }
try { risky(); } catch ({ [(e2(), 'flat')]: f, message }) { console.log(typeof f, message); }
try { risky(); } catch ({ [(e3(), 'includes')]: i = dflt() }) { console.log(typeof i); }
try { risky(); } catch ({ [(e4(), 'flatMap')]: m, ...rest }) { console.log(typeof m, rest); }
// plus-fold computed key routes through the same SE gate as a sequence key
try { risky(); } catch ({ [(e5(), 'toRevers') + 'ed']: r }) { console.log(typeof r); }
// a pattern-valued symbol prop in a catch param destructures the helper result off the
// relocated ref, dropping the dead residual (the catch-born declaration is synthesized, so
// the dead-residual gate must not depend on source positions)
try { risky(); } catch ({ [Symbol.iterator]: { name } }) { console.log(name); }
// with a rest sibling the consumed symbol key keeps a sentinel so rest still excludes it
try { risky(); } catch ({ [Symbol.iterator]: { name }, ...rest }) { console.log(name, rest); }
