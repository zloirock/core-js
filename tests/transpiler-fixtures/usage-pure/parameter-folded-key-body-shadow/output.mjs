import _at from "@core-js/pure/actual/instance/at";
// A parameter key uses its outer constant, not a binding in the body.
// The actual receiver supplies the instance method in both full and stripped realms.
const K = 'at';
export function read(_ref) {
  let at = _at(_ref);
  const K = 'length';
  return [at, K];
}