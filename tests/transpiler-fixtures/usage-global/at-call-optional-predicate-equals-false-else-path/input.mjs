// the `=== false` spelling exits where the optional predicate answered false, so the path that
// continues is the one where it answered true OR never ran: `input` keeps its union and both
// families inject, the same refusal the `!== false` spelling makes on its own truthy side
declare const obj: { isStr?(x: unknown): x is string };
export function isFalseElse(input: string | number[]) {
  if (obj.isStr?.(input) === false) return null;
  return input.at(1);
}
