// A shared nested receiver is captured once before its independent property reads.
// Native siblings keep their position; each typed method keeps its own polyfill.
const [{ w: { at, length }, y: { includes } }] = [{ w: [2, 7], y: 'abc' }, mark()];
use(at, length, includes);
