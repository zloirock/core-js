// param destructure-default with TWO consecutive removed body-extracted props at the HEAD
// (`from`, `of`) followed by a retained string-key sibling (`"z": z`, which bails synth-swap). the
// second removal must consult the preceding removal so the shared comma isn't double-consumed
// (partial-overlap crash). distinct from the tail-run case: here a retained prop follows the run
function f({ from, of, "z": z } = Array) { return [from, of, z]; }
f();
