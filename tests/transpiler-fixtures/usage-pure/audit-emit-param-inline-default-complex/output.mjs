import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// arrow expr-body + AssignmentPattern with complex `right` (ConditionalExpression) +
// rest sibling. all three fallback gates fire: synth-swap bails on rest, body-extract
// bails on missing block body, inline-default fires. `emitParamInlineDefault` detects
// the existing AssignmentPattern wrapper and replaces ONLY `value.right` with the polyfill
// id, so the conditional default expression `cond ? [] : null` is overwritten. distinct
// keys (`from` / `of`) verify per-key dispatch through the same code path
const cond = true;
const f = ({
  from = _Array$from,
  ...rest
} = Array) => [from, rest];
const g = ({
  of = _Array$of,
  ...rest
} = Array) => [of, rest];
export { f, g };