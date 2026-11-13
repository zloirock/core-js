// The whole declaration keeps a positional instance read and its native sibling in order.
const K = 'at';
function* source(value) {
  yield value;
}
export function read() {
  for (const [{ [K]: at, length }] = source([3, 7]);;) return [at, length];
}
