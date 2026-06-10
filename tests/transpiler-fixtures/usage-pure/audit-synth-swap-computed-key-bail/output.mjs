import _Array$from from "@core-js/pure/actual/array/from";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// synthetic argument-receiver substitution can't shape-rebuild when the key is computed and
// non-literal, and the old body-extract fallback was caller-lossy for this DECLARED function.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
function run({
  [_Symbol$iterator]: iter
} = Array) {
  let from = _Array$from;
  return from([1, 2, 3]);
}
run();