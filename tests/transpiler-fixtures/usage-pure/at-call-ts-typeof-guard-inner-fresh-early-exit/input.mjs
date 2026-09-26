// inner fresh conditional re-narrows after a mutation in a sibling block of an
// early-exit guard. tests the early-exit branch's `&& !innerFreshConditional` gate -
// without it, the assertion guard's mutation invalidation would bail the narrowing,
// even though the inner `if` re-evaluates `typeof x` at runtime
declare const mixed: string | number[];
function isString(v: unknown): v is string {
  return typeof v === 'string';
}
declare let x: string | number[];
if (!isString(x)) throw new Error('x must be string');
x = mixed;
if (typeof x === 'string') {
  x.at(0);
}
