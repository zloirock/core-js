import _Array$from from "@core-js/pure/actual/array/from";
// arrow expr-body + destructure-default + rest sibling on a DECLARED (non-invoked) arrow:
// the rest shape blocks a synth-swap, so the leaf default is rewritten in place. that lossy
// emission is sound here ONLY because the function is non-exported and every local call site
// leaves the default in place; exported / escaping / overridden functions stay verbatim.
const f = ({
  from = _Array$from,
  ...rest
} = Array) => [from, rest];
f();