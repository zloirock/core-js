import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// const-Identifier COMPUTED key LAST in a param-default destructure (`{ from, of, [k]: z }`, k='z').
// synth-object parity: `= Array` becomes `{ from: _Array$from, of: _Array$of, [k]: Array[k] }`,
// emitting the computed key at its source position in the literal
const k = "z";
function f({
  from,
  of,
  [k]: z
} = {
  from: _Array$from,
  of: _Array$of,
  [k]: Array[k]
}) {
  return [from, of, z];
}
f();