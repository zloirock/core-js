// A parameter key uses its outer constant, not a binding in the body.
// The actual receiver supplies the instance method in both full and stripped realms.
const K = 'at';
export function read({ [K]: at }) {
  const K = 'length';
  return [at, K];
}
