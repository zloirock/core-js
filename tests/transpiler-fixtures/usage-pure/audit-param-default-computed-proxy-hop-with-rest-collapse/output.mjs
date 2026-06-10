import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// parameter destructure default combining a COMPUTED proxy hop (`globalThis['self']`) with a
// rest sibling on a DECLARED function: the retained default keeps its value-identical collapse
// to `_globalThis.Array`.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
function f({
  from: _unused,
  ...rest
} = _globalThis.Array) {
  let from = _Array$from;
  return [from, rest];
}
f();