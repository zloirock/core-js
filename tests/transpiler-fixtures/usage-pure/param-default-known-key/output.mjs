import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A proven non-colliding string key keeps the ordinary default mirror available.
const key = 'length';
export function read({
  at,
  [key]: other
} = {
  at: _atMaybeArray([7]),
  [key]: [7][key]
}) {
  return [at, other];
}