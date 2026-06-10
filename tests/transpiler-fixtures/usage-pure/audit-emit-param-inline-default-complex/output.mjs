// arrow expr-body + AssignmentPattern with complex `right` (ConditionalExpression) +
// rest sibling. all three fallback gates fire: synth-swap bails on rest, body-extract
// bails on missing block body, inline-default fires. `param inline-default emitter` detects
// the existing AssignmentPattern wrapper and replaces ONLY `value.right` with the polyfill
// id, so the conditional default expression `cond ? [] : null` is overwritten. distinct
// keys (`from` / `of`) verify per-key dispatch through the same code path
const cond = true;
const f = ({
  from = cond ? [] : null,
  ...rest
} = Array) => [from, rest];
const g = ({
  of = cond ? [1] : [2],
  ...rest
} = Array) => [of, rest];
export { f, g };