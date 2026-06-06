// param destructure-default with two removed body-extracted props (`from`, `of`) separated by a
// RETAINED string-key sibling (`"z": z`, which bails synth-swap). the retained prop breaks the run,
// so neither removal is preceded-by-removed: each takes its own clean trailing-comma range and the
// two never overlap (distinct from the contiguous-run cases, which share a comma). regression lock
function f({ from, "z": z, of } = Array) { return [from, of, z]; }
f();
