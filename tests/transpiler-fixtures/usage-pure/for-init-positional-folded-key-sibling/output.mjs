import _at from "@core-js/pure/actual/instance/at";
// The whole declaration keeps a positional instance read and its native sibling in order.
const K = 'at';
function* source(value) {
  yield value;
}
export function read() {
  for (const [_ref] = source([3, 7]), at = _at(_ref), {
      length
    } = _ref;;) return [at, length];
}