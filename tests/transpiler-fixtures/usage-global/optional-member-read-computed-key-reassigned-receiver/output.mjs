import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An optional member read evaluates its receiver before a folded effectful key.
// Its generic instance lookup must stay polyfilled without calling the method here.
export function read(input, replacement) {
  let arr = input;
  const method = arr?.[(() => (arr = replacement, 'at'))()];
  return method?.call(input, 0);
}