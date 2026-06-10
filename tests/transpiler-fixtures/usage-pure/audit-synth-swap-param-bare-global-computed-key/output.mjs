import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// a bare-global computed key (`[Set]` - no in-scope binding) in a DECLARED function's
// param-default pattern must NOT be emitted raw into a synth literal (`{ [Set]: Array[Set] }`,
// ReferenceError on ie:11). the synth bails; the old body-extract fallback was caller-lossy.
// the bare-global key is still rewritten normally to `[_Set]`.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
function f({
  [_Set]: y
} = Array) {
  let from = _Array$from;
  let of = _Array$of;
  return [from, of, y];
}
f();