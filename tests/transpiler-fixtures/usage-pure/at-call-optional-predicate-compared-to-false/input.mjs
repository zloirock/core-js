// a comparison against `false` cannot tell an optional-chained predicate that answered false from
// one that never ran (`undefined !== false` holds): the guard carries nothing on either side of such
// a comparison, so `input` keeps its union and the generic helper dispatches - a deliberate refusal
// of what `tsc` narrows (it reads the comparison two-valued and says `string` on both rows), because
// the string helper on the array the skipped predicate let through throws at runtime. compared
// against `true` the truthy side proves the call ran and narrows
declare const obj: { isStr?(x: unknown): x is string };
export function notFalse(input: string | number[]) {
  if (obj.isStr?.(input) !== false) return input.at(0);
  return null;
}
export function isFalseElse(input: string | number[]) {
  if (obj.isStr?.(input) === false) return null;
  return input.at(1);
}
export function isTrue(input: string | number[]) {
  if (obj.isStr?.(input) === true) return input.includes('a');
  return null;
}
