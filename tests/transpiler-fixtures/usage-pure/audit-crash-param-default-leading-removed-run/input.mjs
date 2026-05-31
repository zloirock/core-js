// param destructure-default with TWO consecutive removed body-extracted props at the HEAD
// (`from`, `of`) followed by a retained computed-key sibling. the second removal must consult the
// preceding removal so the shared comma isn't double-consumed (partial-overlap crash). distinct
// from the tail-run case: here a retained prop follows the run. regression lock
const k = "z";
function f({ from, of, [k]: z } = Array) { return [from, of, z]; }
f();
