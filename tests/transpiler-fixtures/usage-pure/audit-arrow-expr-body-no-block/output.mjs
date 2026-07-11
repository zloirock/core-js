import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Arrow with expression body (not block) and a computed-key sibling: the computed
// `[Symbol.iterator]` key swaps to the pure symbol binding; `from` stays VERBATIM - the
// pattern carries no parameter default to swap, and a declared arrow's callers are not
// provably enumerable, so an injected inline default could override a caller-passed value
const fn = ({
  [_Symbol$iterator]: iter,
  from
}) => from([1, 2]);
fn(Array);