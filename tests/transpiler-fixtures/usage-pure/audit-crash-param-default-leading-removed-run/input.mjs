// param destructure-default with TWO consecutive removed props at the HEAD (`from`, `of`)
// followed by a retained string-key sibling (`"z": z`). the second removal must consult the
// first so the shared comma isn't double-consumed (partial-overlap crash). this DECLARED
// non-exported fn with no escaping call site is safe to emit lossily; others stay verbatim
function f({ from, of, "z": z } = Array) { return [from, of, z]; }
f();
