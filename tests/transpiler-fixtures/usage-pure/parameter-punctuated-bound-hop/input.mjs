// A folded non-identifier key keeps bracket notation on the captured receiver.
const K = 'x-y';
export function read({ [K]: { at } }) {
  return at;
}
