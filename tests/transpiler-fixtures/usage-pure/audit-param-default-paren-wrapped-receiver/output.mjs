import _Array$from from "@core-js/pure/actual/array/from";
// param-default destructure rewriting peels parens from the assignment-pattern default
// position when the parser keeps parens as AST nodes. The peel reaches the inner
// identifier `Array` so the rewrite binds the receiver; without it, the wrapped `(Array)`
// would fail the bare-Identifier check and fall back to a per-key destructure-default
(({
  from
} = ({
  from: _Array$from
})) => from([1]))();