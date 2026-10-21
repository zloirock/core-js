// A common array capture exposes the static leaves behind each realm selection.
// Computed-key effects keep their order; the captured receiver is not mirrored again.
const [{ Array: { [(log.push('k'), 'of')]: a, from: b } }] = [globalThis.window ?? globalThis];
const [{ Array: { [(log.push('k'), 'of')]: c = 1, from: d } }] = [globalThis.window ? globalThis.window : globalThis];
use(a, b, c, d);
