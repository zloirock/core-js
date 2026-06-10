import _Array$from from "@core-js/pure/actual/array/from";
// arrow expr-body + destructure-default + rest sibling on a DECLARED (non-invoked) arrow:
// synth-swap can't rebuild the rest shape, and the old user-default swap silently polyfilled an
// ABSENT caller leaf that native leaves at the user default.
// caller-soundness: lossy emissions are allowed here because the function is non-exported and
// every local call leaves the default in place (the resolver's call-site scan proves nothing
// exists to lose); exported / escaping / overridden functions stay verbatim instead.
const f = ({
  from = _Array$from,
  ...rest
} = Array) => [from, rest];
f();