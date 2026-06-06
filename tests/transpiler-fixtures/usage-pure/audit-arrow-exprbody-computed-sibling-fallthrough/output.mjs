import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// arrow expr-body + computed-key sibling: synth-swap bails (computed key not synth-simple),
// body-extract bails (no BlockStatement body slot), falls through to inline-default with
// `{from = _polyfill}` AssignmentPattern shape preserving caller `f({from: customFn})`.
// distinct methods (Array.from / Array.of) probe both keys' inline-default emission.
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