import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// a structural predicate's target rides on the guard whatever the test's own polarity: `if (!isBox(x))
// return;` establishes `x is Box` after it exactly as the positive spelling does inside its branch, so
// `x.items` resolves through the interface to the array family on both
interface Box {
  items: string[];
}
declare function isBox(x: unknown): x is Box;
export function negated(x: unknown) {
  if (!isBox(x)) return null;
  return x.items.at(0);
}
export function positive(x: unknown) {
  if (isBox(x)) return x.items.includes('q');
  return null;
}