import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// arrow expr-body + computed-key sibling: the synth-swap handles the computed sibling by
// re-reading its key off the raw receiver, so the whole default swaps to a synthesized
// literal and the pattern survives - a caller-passed `f({from: customFn})` still wins.
// distinct methods (Array.from / Array.of) keep the two keys' imports distinguishable.
const k = 'foo';
const f = ({
  from,
  [k]: any
} = {
  from: _Array$from,
  [k]: Array[k]
}) => from([1]);
const g = ({
  of,
  [k]: any2
} = {
  of: _Array$of,
  [k]: Array[k]
}) => of(7, 8);
export { f, g };