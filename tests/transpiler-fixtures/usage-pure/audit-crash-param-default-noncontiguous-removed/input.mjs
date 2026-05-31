// param destructure-default with two removed body-extracted props (`from`, `of`) separated by a
// RETAINED computed-key sibling (`[k]: z`). the retained prop breaks the run, so neither removal
// is preceded-by-removed: each takes its own clean trailing-comma range and the two never overlap
// (distinct from the contiguous-run cases, which share a comma). regression lock
const k = "z";
function f({ from, [k]: z, of } = Array) { return [from, of, z]; }
f();
