// A folded instance key and its native sibling share the captured element.
const K = 'at';
function* source(value) {
  yield value;
}
const [{ [K]: at, length }] = source([3, 7]);
export { at, length };
