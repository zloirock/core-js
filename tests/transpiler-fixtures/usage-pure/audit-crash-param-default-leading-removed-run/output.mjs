import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// param destructure-default with TWO consecutive removed body-extracted props at the HEAD
// (`from`, `of`) followed by a retained string-key sibling (`"z": z`, which bails synth-swap). the
// second removal must consult the preceding removal so the shared comma isn't double-consumed
// (partial-overlap crash). distinct from the tail-run case: here a retained prop follows the run
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