import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with two removed body-extracted props (`from`, `of`) separated by a
// RETAINED string-key sibling (`"z": z`, which bails synth-swap). the retained prop breaks the run,
// so neither removal is preceded-by-removed: each takes its own clean trailing-comma range and the
// two never overlap (distinct from the contiguous-run cases, which share a comma). regression lock
// NOTE: this DECLARED function is non-exported and every local call leaves the default in
// place, so the resolver's call-site scan proves the lossy emission loses nothing and it
// stays enabled; exported / escaping / overridden functions stay verbatim instead
function f({
  "z": z
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, z];
}
f();