import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Either constructor arm supplies the Array prototype; the test still runs once.
export function read(pick) {
  const at = _atMaybeArray((pick() ? Array : Array).prototype);
  return at.call([4], 0);
}
export const result = [read(() => true), read(() => false)];