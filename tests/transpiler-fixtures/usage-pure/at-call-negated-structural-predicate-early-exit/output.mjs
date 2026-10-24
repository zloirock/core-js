import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a structural predicate's target rides on the guard whatever the test's own polarity: `if (!isBox(x))
// return;` establishes `x is Box` after it exactly as the positive spelling does inside its branch, so
// `x.items` resolves through the interface to the array family on both
interface Box {
  items: string[];
}
declare function isBox(x: unknown): x is Box;
export function negated(x: unknown) {
  var _ref;
  if (!isBox(x)) return null;
  return _atMaybeArray(_ref = x.items).call(_ref, 0);
}
export function positive(x: unknown) {
  var _ref2;
  if (isBox(x)) return _atMaybeArray(_ref2 = x.items).call(_ref2, 0);
  return null;
}