import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// `break outer` targeting the label that WRAPS the guard-if resumes right after it - at
// the guarded use itself - so it is not an exit and the guard must not narrow (the
// narrow keyed an array Maybe to the string the "exiting" branch carries, ie:11)
export function viaLabeledBreak(x: string | number[]) {
  outer: if (typeof x === 'string') break outer;
  return _at(x).call(x, 0);
}

// a real return-exit guard still narrows
export function viaReturnExit(x: string | number[]) {
  if (typeof x === 'string') return null;
  return _includesMaybeArray(x).call(x, 1);
}