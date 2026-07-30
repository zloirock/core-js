// param destructure-default with TWO consecutive removed props at the HEAD (`from`, `of`)
// followed by a retained string-key sibling (`"z": z`). the second removal must consult the
// first so the shared comma isn't double-consumed (partial-overlap crash). this DECLARED
// non-exported fn with no escaping call site is safe to emit lossily; others stay verbatim
// the pattern SYNTHS its default instead: a caller-correct literal beats the lossy removal, and it
// does so whatever the call sites look like. what this shape locks is therefore that the geometry no
// longer reaches the removal path - the ranges themselves are exercised where a dynamic computed key
// makes the literal impossible
function f({ from, of, "z": z } = Array) { return [from, of, z]; }
f();
