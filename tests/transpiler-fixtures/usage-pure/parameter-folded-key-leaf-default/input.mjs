// A folded key and its literal default keep the same receiver and guard.
const K = 'at';
export function read({ [K]: at = null }) {
  return at;
}
