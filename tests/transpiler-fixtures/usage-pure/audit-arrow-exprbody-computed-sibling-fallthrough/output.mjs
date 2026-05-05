import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// arrow expr-body + computed-key sibling: synth-swap bails (computed key not synth-simple),
// body-extract bails (no BlockStatement body slot), falls through to inline-default with
// `{from = _polyfill}` AssignmentPattern shape preserving caller `f({from: customFn})`.
// distinct methods (Array.from / Array.of) probe both keys' inline-default emission.
const k = 'foo';
const f = ({
  from = _Array$from,
  [k]: any
} = Array) => from([1]);
const g = ({
  of = _Array$of,
  [k]: any2
} = Array) => of(7, 8);
export { f, g };