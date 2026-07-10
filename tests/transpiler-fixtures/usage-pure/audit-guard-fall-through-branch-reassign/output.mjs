import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// an early-exit guard's NON-exiting branch falls through to the use, so its trailing
// reassign DOMINATES there: the stale guard narrow drops and the reassigned value's own
// type resolves precisely (a number receiver has no `.at` family - untouched; an array
// one gets the array Maybe). both fall-through shapes
export function viaElseExit(x: unknown) {
  if (typeof x === 'string') {
    x = 5;
  } else throw 0;
  return x.at(0);
}
export function viaConsequentExit(x: string | number[], arr: number[]) {
  if (typeof x !== 'string') {
    return null;
  } else {
    x = arr;
  }
  return _includesMaybeArray(x).call(x, 'a');
}

// a reassign-free fall-through keeps the guard narrow
export function viaCleanGuard(x: unknown) {
  if (typeof x === 'string') {
    // fall through
  } else throw 0;
  return _atMaybeString(x).call(x, 0);
}