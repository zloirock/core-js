// a side-effecting computed key in a catch param extracts the dispatcher binding while the
// key survives in the residual (effect once, in order); the user default is dead code
try { risky(); } catch ({ [(e1(), 'at')]: v }) { console.log(typeof v); }
try { risky(); } catch ({ [(e2(), 'flat')]: f, message }) { console.log(typeof f, message); }
try { risky(); } catch ({ [(e3(), 'includes')]: i = dflt() }) { console.log(typeof i); }
try { risky(); } catch ({ [(e4(), 'flatMap')]: m, ...rest }) { console.log(typeof m, rest); }
