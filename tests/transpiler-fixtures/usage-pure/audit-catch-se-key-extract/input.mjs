// a side-effecting computed key in a catch param extracts the dispatcher binding while the
// key survives in the residual (effect once, in order); a user default on an instance leaf
// stays LIVE and guarded AFTER the residual (the dispatcher may return undefined on a foreign
// receiver, and native fires the default after the key's effect)
try { risky(); } catch ({ [(e1(), 'at')]: v }) { console.log(typeof v); }
try { risky(); } catch ({ [(e2(), 'flat')]: f, message }) { console.log(typeof f, message); }
try { risky(); } catch ({ [(e3(), 'includes')]: i = dflt() }) { console.log(typeof i); }
try { risky(); } catch ({ [(e4(), 'flatMap')]: m, ...rest }) { console.log(typeof m, rest); }
// plus-fold computed key routes through the same SE gate as a sequence key
try { risky(); } catch ({ [(e5(), 'toRevers') + 'ed']: r }) { console.log(typeof r); }
// multi-prop catch: the guarded default's segment flushes BEFORE its extraction line, so
// the second key's effect stays after the first default (native per-prop order)
try { risky(); } catch ({ [(e6(), 'toSorted')]: ts = dflt2(), [(e7(), 'toSpliced')]: tsp }) { console.log(typeof ts, typeof tsp); }
// under REST the pattern stays whole, and the deferred guarded default lands AFTER the
// rebuilt pattern - the kept key's effect still precedes the default
try { risky(); } catch ({ [(e8(), 'findLast')]: fnl = dflt3(), ...restA }) { console.log(typeof fnl, restA); }

// both props defaulted, no rest: per-prop segments (key, guard, key, guard)
try { risky(); } catch ({ [(e9(), 'findLastIndex')]: fli = dflt4(), [(e10(), 'with')]: w10 = dflt5() }) { console.log(fli, w10); }

// a plain (non-computed) key with a default guards through the relocated per-prop channel
try { risky(); } catch ({ entries: en = dflt6() }) { console.log(en); }

// a non-entry prop between two entries joins the segment before the guard
try { risky(); } catch ({ [(e11(), 'keys')]: ks = dflt7(), message, [(e12(), 'fill')]: fi }) { console.log(ks, message, fi); }

// a pattern-valued symbol prop in a catch param destructures the helper result off the
// relocated ref, dropping the dead residual (the catch-born declaration is synthesized, so
// the dead-residual gate must not depend on source positions)
try { risky(); } catch ({ [Symbol.iterator]: { name } }) { console.log(name); }
// with a rest sibling the consumed symbol key keeps a sentinel so rest still excludes it
try { risky(); } catch ({ [Symbol.iterator]: { name }, ...rest }) { console.log(name, rest); }
