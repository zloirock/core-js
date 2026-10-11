// a catch parameter's own names are bindings of its environment, so a closure written in a later default
// of that parameter reads the caught value, never the global of the same name
try { f(); } catch ({ Promise, p = () => Promise.resolve(1) }) { use(p()); }
try { f(); } catch ([Map, m = () => Map.groupBy(xs, g)]) { use(m()); }
try { f(); } catch ({ o: { Iterator }, i = () => Iterator.from(xs) }) { use(i()); }
