// a namespaced class type referenced multiple times recovers its declaration NodePath once (memoized
// per node) and resolves identically each time. distinct methods per use prove the memo returns the
// correct path for the repeated reference, not a stale or wrong one.
declare namespace NS { class Box { items(): number[]; } }
function first(x: NS.Box) { return x.items().at(0); }
function second(y: NS.Box) { return y.items().includes(1); }
