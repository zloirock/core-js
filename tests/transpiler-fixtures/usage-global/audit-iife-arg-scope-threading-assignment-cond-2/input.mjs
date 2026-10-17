// the reachable-union of a reassigned outer binding flows through a SHADOWED AP arg:
// candidates resolve at the call site, so the shadow cannot swallow the union
let R2 = WeakSet;
if (globalThis.cond) R2 = Iterator;
